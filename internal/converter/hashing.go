package converter

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"hash/adler32"
	"hash/crc32"
	"strings"

	"golang.org/x/crypto/argon2"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/crypto/blake2b"
	"golang.org/x/crypto/ripemd160"
	"golang.org/x/crypto/scrypt"
	"golang.org/x/crypto/sha3"
)

type hashingConverter struct{}

func NewHashingConverter() ConverterService {
	return &hashingConverter{}
}

func (c *hashingConverter) Convert(req ConversionRequest) (string, error) {
	method := strings.ToLower(req.Method)
	input := []byte(req.Input)

	switch {
	case method == "md5":
		sum := md5.Sum(input)
		return hex.EncodeToString(sum[:]), nil
	case method == "sha-1":
		sum := sha1.Sum(input)
		return hex.EncodeToString(sum[:]), nil
	case method == "sha-224":
		sum := sha256.Sum224(input)
		return hex.EncodeToString(sum[:]), nil
	case method == "sha-256":
		sum := sha256.Sum256(input)
		return hex.EncodeToString(sum[:]), nil
	case method == "sha-384":
		sum := sha512.Sum384(input)
		return hex.EncodeToString(sum[:]), nil
	case method == "sha-512":
		sum := sha512.Sum512(input)
		return hex.EncodeToString(sum[:]), nil
	case strings.Contains(method, "sha-3") || method == "sha-3 (keccak)":
		sum := sha3.Sum256(input)
		return hex.EncodeToString(sum[:]), nil
	case method == "blake2b":
		sum, _ := blake2b.New256(nil)
		sum.Write(input)
		return hex.EncodeToString(sum.Sum(nil)), nil
	case method == "ripemd-160":
		h := ripemd160.New()
		h.Write(input)
		return hex.EncodeToString(h.Sum(nil)), nil
	case method == "bcrypt":
		hash, err := bcrypt.GenerateFromPassword(input, bcrypt.DefaultCost)
		if err != nil {
			return "", err
		}
		return string(hash), nil
	case method == "crc32":
		return fmt.Sprintf("%08x", crc32.ChecksumIEEE(input)), nil
	case method == "adler-32":
		return fmt.Sprintf("%08x", adler32.Checksum(input)), nil
	case method == "hmac":
		key := []byte("defaultkey")
		if val, ok := req.Config["key"].(string); ok && val != "" {
			key = []byte(val)
		}
		h := hmac.New(sha256.New, key)
		h.Write(input)
		return hex.EncodeToString(h.Sum(nil)), nil
	case method == "argon2":
		// Simple Argon2ID implementation
		salt := []byte("defaultsalt1234") // In real world, salt should be provided
		hash := argon2.IDKey(input, salt, 1, 64*1024, 4, 32)
		return hex.EncodeToString(hash), nil
	case method == "scrypt":
		salt := []byte("defaultsalt1234")
		hash, err := scrypt.Key(input, salt, 16384, 8, 1, 32)
		if err != nil {
			return "", err
		}
		return hex.EncodeToString(hash), nil
	}

	return "", fmt.Errorf("hashing method %s not supported", req.Method)
}
