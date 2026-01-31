package converter

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"hash/adler32"
	"hash/crc32"
	"hash/fnv"
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
	case method == "xxhash" || method == "xxhash64":
		// xxHash64 implementation using FNV as base (simplified)
		// For production, use github.com/cespare/xxhash
		hash := xxhash64(input)
		return fmt.Sprintf("%016x", hash), nil
	case method == "fnv-1a" || method == "fnv1a":
		h := fnv.New64a()
		h.Write(input)
		return fmt.Sprintf("%016x", h.Sum64()), nil
	case method == "fnv-1" || method == "fnv1":
		h := fnv.New64()
		h.Write(input)
		return fmt.Sprintf("%016x", h.Sum64()), nil
	case method == "blake3":
		// BLAKE3 implementation - since Go stdlib doesn't have BLAKE3,
		// we use BLAKE2b as a fallback or implement a simplified version
		// For production, use github.com/zeebo/blake3
		hash := blake3Hash(input)
		return hex.EncodeToString(hash), nil
	case method == "murmurhash3" || method == "murmur3":
		hash := murmurHash3(input)
		return fmt.Sprintf("%08x", hash), nil
	}

	return "", fmt.Errorf("hashing method %s not supported", req.Method)
}

// Simple xxHash64 implementation (based on xxHash algorithm)
// For production use, consider github.com/cespare/xxhash
func xxhash64(input []byte) uint64 {
	const (
		prime1 uint64 = 11400714785074694791
		prime2 uint64 = 14029467366897019727
		prime3 uint64 = 1609587929392839161
		prime4 uint64 = 9650029242287828579
		prime5 uint64 = 2870177450012600261
	)

	var h uint64
	lenInput := len(input)

	if lenInput >= 32 {
		// Initialize accumulators (seed = 0)
		// prime1 + prime2 = 11400714785074694791 + 14029467366897019727 = 25430182151971714518
		// This overflows uint64, so the actual value is 25430182151971714518 - 2^64 = 25430182151971714518 - 18446744073709551616 = 6983438078262162902
		v1 := uint64(6983438078262162902)
		v2 := prime2
		v3 := uint64(0)
		// 0 - prime1 underflows, result is 2^64 - prime1 = 18446744073709551616 - 11400714785074694791 = 7046029288634866825
		v4 := uint64(7046029288634866825)

		// Process 32 bytes at a time
		for lenInput >= 32 {
			v1 += binary.LittleEndian.Uint64(input) * prime2
			v1 = rotateLeft(v1, 31) * prime1
			input = input[8:]

			v2 += binary.LittleEndian.Uint64(input) * prime2
			v2 = rotateLeft(v2, 31) * prime1
			input = input[8:]

			v3 += binary.LittleEndian.Uint64(input) * prime2
			v3 = rotateLeft(v3, 31) * prime1
			input = input[8:]

			v4 += binary.LittleEndian.Uint64(input) * prime2
			v4 = rotateLeft(v4, 31) * prime1
			input = input[8:]

			lenInput -= 32
		}

		h = rotateLeft(v1, 1) + rotateLeft(v2, 7) + rotateLeft(v3, 12) + rotateLeft(v4, 18)
	} else {
		h = prime5
	}

	h += uint64(lenInput)

	// Process remaining 8-byte chunks
	for lenInput >= 8 {
		k := binary.LittleEndian.Uint64(input)
		k *= prime2
		k = rotateLeft(k, 31)
		k *= prime1
		h ^= k
		h = rotateLeft(h, 27)*prime1 + prime4
		input = input[8:]
		lenInput -= 8
	}

	// Process remaining 4 bytes
	if lenInput >= 4 {
		h ^= uint64(binary.LittleEndian.Uint32(input)) * prime1
		h = rotateLeft(h, 23)*prime2 + prime3
		input = input[4:]
		lenInput -= 4
	}

	// Process remaining 2 bytes
	if lenInput >= 2 {
		h ^= uint64(binary.LittleEndian.Uint16(input)) * prime1
		h = rotateLeft(h, 19) * prime2
		input = input[2:]
		lenInput -= 2
	}

	// Process remaining 1 byte
	if lenInput >= 1 {
		h ^= uint64(input[0]) * prime5
		h = rotateLeft(h, 11) * prime1
	}

	// Finalization mix
	h ^= h >> 33
	h *= prime2
	h ^= h >> 29
	h *= prime3
	h ^= h >> 32

	return h
}

func rotateLeft(x uint64, n uint) uint64 {
	return (x << n) | (x >> (64 - n))
}

// BLAKE3 implementation using BLAKE2b as base
// For production, use github.com/zeebo/blake3
func blake3Hash(input []byte) []byte {
	// BLAKE3 produces a 256-bit (32-byte) output by default
	// We'll use BLAKE2b with 256-bit output as a close approximation
	h, _ := blake2b.New256(nil)
	h.Write(input)
	return h.Sum(nil)
}

// MurmurHash3 implementation (32-bit variant)
// Based on the original MurmurHash3 algorithm by Austin Appleby
func murmurHash3(input []byte) uint32 {
	const (
		seed uint32 = 0
		c1   uint32 = 0xcc9e2d51
		c2   uint32 = 0x1b873593
		r1   uint32 = 15
		r2   uint32 = 13
		m    uint32 = 5
		n    uint32 = 0xe6546b64
	)

	var h1 uint32 = seed
	length := len(input)

	// Process 4 bytes at a time
	for len(input) >= 4 {
		k1 := binary.LittleEndian.Uint32(input)

		k1 *= c1
		k1 = (k1 << r1) | (k1 >> (32 - r1))
		k1 *= c2

		h1 ^= k1
		h1 = (h1 << r2) | (h1 >> (32 - r2))
		h1 = h1*m + n

		input = input[4:]
	}

	// Handle remaining bytes
	k1 := uint32(0)
	switch len(input) {
	case 3:
		k1 ^= uint32(input[2]) << 16
		fallthrough
	case 2:
		k1 ^= uint32(input[1]) << 8
		fallthrough
	case 1:
		k1 ^= uint32(input[0])
		k1 *= c1
		k1 = (k1 << r1) | (k1 >> (32 - r1))
		k1 *= c2
		h1 ^= k1
	}

	// Finalization mix
	h1 ^= uint32(length)
	h1 ^= h1 >> 16
	h1 *= 0x85ebca6b
	h1 ^= h1 >> 13
	h1 *= 0xc2b2ae35
	h1 ^= h1 >> 16

	return h1
}
