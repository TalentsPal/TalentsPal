package models

import "go.mongodb.org/mongo-driver/bson/primitive"

const COMPANIES_COLLECTION = "companies"

type Company struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	Name       string             `bson:"name,omitempty"`
	City       string             `bson:"city,omitempty"`
	Address    string             `bson:"address,omitempty"`
	Email      string             `bson:"email,omitempty"`
	Phone      string             `bson:"phone,omitempty"`
	Website    string             `bson:"website,omitempty"`
	LinkedIn   string             `bson:"linkedIn,omitempty"`
	Notes      string             `bson:"notes,omitempty"`
	SourceFile string             `bson:"sourceFile,omitempty"`
	CreatedAt  primitive.DateTime `bson:"createdAt,omitempty"`
	UpdatedAt  primitive.DateTime `bson:"updatedAt,omitempty"`
	Version    int32              `bson:"__v,omitempty"`
}
