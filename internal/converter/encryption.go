package converter

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/des"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"strings"

	"golang.org/x/crypto/chacha20"
	"golang.org/x/crypto/salsa20"
)

type encryptionConverter struct{}

func NewEncryptionConverter() ConverterService {
	return &encryptionConverter{}
}

func (c *encryptionConverter) Convert(req ConversionRequest) (string, error) {
	subMode := "encrypt"
	if val, ok := req.Config["subMode"].(string); ok {
		subMode = val
	}
	isEncrypt := strings.ToLower(subMode) != "decrypt"
	method := strings.ToLower(req.Method)

	key := []byte("")
	if val, ok := req.Config["key"].(string); ok {
		key = []byte(val)
	}

	iv := []byte("")
	if val, ok := req.Config["iv"].(string); ok {
		iv = []byte(val)
	}

	switch {
	case method == "aes":
		// Validate key and IV lengths first
		if len(key) != 32 {
			return "", fmt.Errorf("AES-256 requires exactly 32 bytes key (received %d bytes). Please ensure your key is exactly 32 characters", len(key))
		}
		if len(iv) != aes.BlockSize {
			return "", fmt.Errorf("AES-CBC requires exactly %d bytes IV (received %d bytes). Please ensure your IV is exactly 16 characters", aes.BlockSize, len(iv))
		}

		block, err := aes.NewCipher(key)
		if err != nil {
			return "", fmt.Errorf("failed to create AES cipher: %w", err)
		}

		if isEncrypt {
			padding := aes.BlockSize - len(req.Input)%aes.BlockSize
			plaintext := append([]byte(req.Input), strings.Repeat(string(byte(padding)), padding)...)
			ciphertext := make([]byte, len(plaintext))
			mode := cipher.NewCBCEncrypter(block, iv)
			mode.CryptBlocks(ciphertext, plaintext)
			return base64.StdEncoding.EncodeToString(ciphertext), nil
		} else {
			ciphertext, err := base64.StdEncoding.DecodeString(req.Input)
			if err != nil {
				return "", err
			}
			if len(ciphertext)%aes.BlockSize != 0 {
				return "", fmt.Errorf("ciphertext block size error")
			}
			plaintext := make([]byte, len(ciphertext))
			mode := cipher.NewCBCDecrypter(block, iv)
			mode.CryptBlocks(plaintext, ciphertext)
			unpadding := int(plaintext[len(plaintext)-1])
			if unpadding > len(plaintext) {
				return "", fmt.Errorf("invalid padding")
			}
			return string(plaintext[:len(plaintext)-unpadding]), nil
		}

	case method == "aes-gcm":
		// AES-GCM mode - provides authenticated encryption
		if len(key) != 32 {
			return "", fmt.Errorf("AES-256-GCM requires exactly 32 bytes key (received %d bytes)", len(key))
		}
		// GCM uses a nonce (IV) of 12 bytes
		if len(iv) != 12 {
			return "", fmt.Errorf("AES-GCM requires exactly 12 bytes nonce (received %d bytes)", len(iv))
		}

		block, err := aes.NewCipher(key)
		if err != nil {
			return "", fmt.Errorf("failed to create AES cipher: %w", err)
		}

		gcm, err := cipher.NewGCM(block)
		if err != nil {
			return "", fmt.Errorf("failed to create GCM: %w", err)
		}

		if isEncrypt {
			// Seal automatically generates and appends the tag
			ciphertext := gcm.Seal(nil, iv, []byte(req.Input), nil)
			return base64.StdEncoding.EncodeToString(ciphertext), nil
		} else {
			ciphertext, err := base64.StdEncoding.DecodeString(req.Input)
			if err != nil {
				return "", err
			}
			plaintext, err := gcm.Open(nil, iv, ciphertext, nil)
			if err != nil {
				return "", fmt.Errorf("decryption failed (invalid key, nonce, or ciphertext): %w", err)
			}
			return string(plaintext), nil
		}

	case method == "des":
		block, err := des.NewCipher(key) // Key must be 8 bytes
		if err != nil {
			return "", err
		}
		if len(iv) != des.BlockSize {
			return "", fmt.Errorf("IV length must be %d", des.BlockSize)
		}
		if isEncrypt {
			padding := des.BlockSize - len(req.Input)%des.BlockSize
			plaintext := append([]byte(req.Input), strings.Repeat(string(byte(padding)), padding)...)
			ciphertext := make([]byte, len(plaintext))
			mode := cipher.NewCBCEncrypter(block, iv)
			mode.CryptBlocks(ciphertext, plaintext)
			return base64.StdEncoding.EncodeToString(ciphertext), nil
		} else {
			ciphertext, err := base64.StdEncoding.DecodeString(req.Input)
			if err != nil {
				return "", err
			}
			plaintext := make([]byte, len(ciphertext))
			mode := cipher.NewCBCDecrypter(block, iv)
			mode.CryptBlocks(plaintext, ciphertext)
			unpadding := int(plaintext[len(plaintext)-1])
			return string(plaintext[:len(plaintext)-unpadding]), nil
		}

	case method == "triple des" || method == "3des" || method == "tripledes":
		// Triple DES (3DES) using Encrypt-Decrypt-Encrypt (EDE) mode
		if len(key) != 24 {
			return "", fmt.Errorf("Triple DES requires exactly 24 bytes key (3 * 8 bytes)")
		}
		if len(iv) != des.BlockSize {
			return "", fmt.Errorf("IV length must be %d bytes for Triple DES", des.BlockSize)
		}

		block, err := des.NewTripleDESCipher(key)
		if err != nil {
			return "", fmt.Errorf("failed to create Triple DES cipher: %w", err)
		}

		if isEncrypt {
			padding := des.BlockSize - len(req.Input)%des.BlockSize
			plaintext := append([]byte(req.Input), strings.Repeat(string(byte(padding)), padding)...)
			ciphertext := make([]byte, len(plaintext))
			mode := cipher.NewCBCEncrypter(block, iv)
			mode.CryptBlocks(ciphertext, plaintext)
			return base64.StdEncoding.EncodeToString(ciphertext), nil
		} else {
			ciphertext, err := base64.StdEncoding.DecodeString(req.Input)
			if err != nil {
				return "", err
			}
			if len(ciphertext)%des.BlockSize != 0 {
				return "", fmt.Errorf("ciphertext block size error")
			}
			plaintext := make([]byte, len(ciphertext))
			mode := cipher.NewCBCDecrypter(block, iv)
			mode.CryptBlocks(plaintext, ciphertext)
			unpadding := int(plaintext[len(plaintext)-1])
			if unpadding > len(plaintext) || unpadding == 0 || unpadding > des.BlockSize {
				return "", fmt.Errorf("invalid padding")
			}
			// Verify padding
			for i := len(plaintext) - unpadding; i < len(plaintext); i++ {
				if int(plaintext[i]) != unpadding {
					return "", fmt.Errorf("invalid padding")
				}
			}
			return string(plaintext[:len(plaintext)-unpadding]), nil
		}

	case method == "chacha20":
		if len(key) != 32 {
			return "", fmt.Errorf("chacha20 requires 32 byte key")
		}
		if len(iv) != 12 { // RFC 7539 nonce
			return "", fmt.Errorf("chacha20 requires 12 byte nonce (IV)")
		}
		cipher, err := chacha20.NewUnauthenticatedCipher(key, iv)
		if err != nil {
			return "", err
		}
		input := []byte(req.Input)
		if !isEncrypt {
			input, err = base64.StdEncoding.DecodeString(req.Input)
			if err != nil {
				return "", err
			}
		}
		out := make([]byte, len(input))
		cipher.XORKeyStream(out, input)
		if isEncrypt {
			return base64.StdEncoding.EncodeToString(out), nil
		}
		return string(out), nil

	case method == "salsa20":
		if len(key) != 32 {
			return "", fmt.Errorf("salsa20 requires 32 byte key")
		}
		if len(iv) != 24 { // Salsa20 nonce
			return "", fmt.Errorf("salsa20 requires 24 byte nonce (IV)")
		}
		input := []byte(req.Input)
		if !isEncrypt {
			var err error
			input, err = base64.StdEncoding.DecodeString(req.Input)
			if err != nil {
				return "", err
			}
		}
		out := make([]byte, len(input))
		var nonce [24]byte
		copy(nonce[:], iv)
		var k [32]byte
		copy(k[:], key)
		salsa20.XORKeyStream(out, input, nonce[:], &k)
		if isEncrypt {
			return base64.StdEncoding.EncodeToString(out), nil
		}
		return string(out), nil

	case method == "xor":
		input := []byte(req.Input)
		if !isEncrypt {
			var err error
			input, err = base64.StdEncoding.DecodeString(req.Input)
			if err != nil {
				return "", err
			}
		}
		out := make([]byte, len(input))
		for i := 0; i < len(input); i++ {
			out[i] = input[i] ^ key[i%len(key)]
		}
		if isEncrypt {
			return base64.StdEncoding.EncodeToString(out), nil
		}
		return string(out), nil

	case method == "rc4":
		if len(key) == 0 {
			return "", fmt.Errorf("RC4 requires a key")
		}

		// RC4 uses XOR-based stream cipher - encrypt and decrypt are the same operation
		input := []byte(req.Input)
		if !isEncrypt {
			var err error
			input, err = base64.StdEncoding.DecodeString(req.Input)
			if err != nil {
				return "", err
			}
		}

		// Simple RC4 implementation (for production, use crypto/rc4)
		// This is a basic KSA + PRGA implementation
		S := make([]byte, 256)
		for i := 0; i < 256; i++ {
			S[i] = byte(i)
		}

		// Key-scheduling algorithm (KSA)
		j := 0
		for i := 0; i < 256; i++ {
			j = (j + int(S[i]) + int(key[i%len(key)])) % 256
			S[i], S[j] = S[j], S[i]
		}

		// Pseudo-random generation algorithm (PRGA)
		out := make([]byte, len(input))
		i, j := 0, 0
		for k := 0; k < len(input); k++ {
			i = (i + 1) % 256
			j = (j + int(S[i])) % 256
			S[i], S[j] = S[j], S[i]
			out[k] = input[k] ^ S[(int(S[i])+int(S[j]))%256]
		}

		if isEncrypt {
			return base64.StdEncoding.EncodeToString(out), nil
		}
		return string(out), nil

	case method == "rsa":
		// RSA encryption/decryption - accepts base64-encoded PEM keys
		if isEncrypt {
			// Get public key from config
			publicKeyPEM, ok := req.Config["publicKey"].(string)
			if !ok || publicKeyPEM == "" {
				return "", fmt.Errorf("RSA encryption requires publicKey in config")
			}

			// Decode base64-encoded public key
			publicKeyData, err := base64.StdEncoding.DecodeString(publicKeyPEM)
			if err != nil {
				return "", fmt.Errorf("failed to decode base64 public key: %w", err)
			}

			// Parse PEM block
			block, _ := pem.Decode(publicKeyData)
			if block == nil {
				return "", fmt.Errorf("failed to parse public key PEM")
			}

			// Parse RSA public key
			var pubKey *rsa.PublicKey
			switch block.Type {
			case "RSA PUBLIC KEY":
				pubKey, err = x509.ParsePKCS1PublicKey(block.Bytes)
			case "PUBLIC KEY":
				keyInterface, err := x509.ParsePKIXPublicKey(block.Bytes)
				if err != nil {
					return "", fmt.Errorf("failed to parse PKIX public key: %w", err)
				}
				var ok bool
				pubKey, ok = keyInterface.(*rsa.PublicKey)
				if !ok {
					return "", fmt.Errorf("key is not an RSA public key")
				}
			default:
				return "", fmt.Errorf("unsupported public key format: %s", block.Type)
			}
			if err != nil {
				return "", fmt.Errorf("failed to parse public key: %w", err)
			}

			// Encrypt the data
			plaintext := []byte(req.Input)
			ciphertext, err := rsa.EncryptPKCS1v15(rand.Reader, pubKey, plaintext)
			if err != nil {
				return "", fmt.Errorf("RSA encryption failed: %w", err)
			}

			return base64.StdEncoding.EncodeToString(ciphertext), nil
		} else {
			// Get private key from config
			privateKeyPEM, ok := req.Config["privateKey"].(string)
			if !ok || privateKeyPEM == "" {
				return "", fmt.Errorf("RSA decryption requires privateKey in config")
			}

			// Decode base64-encoded private key
			privateKeyData, err := base64.StdEncoding.DecodeString(privateKeyPEM)
			if err != nil {
				return "", fmt.Errorf("failed to decode base64 private key: %w", err)
			}

			// Parse PEM block
			block, _ := pem.Decode(privateKeyData)
			if block == nil {
				return "", fmt.Errorf("failed to parse private key PEM")
			}

			// Parse RSA private key
			var privKey *rsa.PrivateKey
			switch block.Type {
			case "RSA PRIVATE KEY":
				privKey, err = x509.ParsePKCS1PrivateKey(block.Bytes)
			case "PRIVATE KEY":
				keyInterface, err := x509.ParsePKCS8PrivateKey(block.Bytes)
				if err != nil {
					return "", fmt.Errorf("failed to parse PKCS8 private key: %w", err)
				}
				var ok bool
				privKey, ok = keyInterface.(*rsa.PrivateKey)
				if !ok {
					return "", fmt.Errorf("key is not an RSA private key")
				}
			default:
				return "", fmt.Errorf("unsupported private key format: %s", block.Type)
			}
			if err != nil {
				return "", fmt.Errorf("failed to parse private key: %w", err)
			}

			// Decode base64 ciphertext
			ciphertext, err := base64.StdEncoding.DecodeString(req.Input)
			if err != nil {
				return "", fmt.Errorf("failed to decode ciphertext: %w", err)
			}

			// Decrypt the data
			plaintext, err := rsa.DecryptPKCS1v15(rand.Reader, privKey, ciphertext)
			if err != nil {
				return "", fmt.Errorf("RSA decryption failed: %w", err)
			}

			return string(plaintext), nil
		}
	}

	return "", fmt.Errorf("encryption method %s not supported", req.Method)
}
