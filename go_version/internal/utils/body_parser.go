package utils

import (
	"encoding/json"
	"errors"
	"io"
)

func BodyParser(body io.Reader, target any) error {
	body_bytes, err := io.ReadAll(body)
	if err != nil {
		return errors.New("error while reading body: " + err.Error())
	}

	err = json.Unmarshal(body_bytes, target)
	if err != nil {
		return errors.New("error while decoding body: " + err.Error())
	}

	return nil
}
