package models

import "go.mongodb.org/mongo-driver/bson/primitive"

const MAJORS_COLLECTION = "majors"

type Major struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Name      string             `bson:"name,omitempty"`
	Category  string             `bson:"category,omitempty"`
	IsActive  bool               `bson:"isActive,omitempty"`
	CreatedAt primitive.DateTime `bson:"createdAt,omitempty"`
	UpdatedAt primitive.DateTime `bson:"updatedAt,omitempty"`
	Version   int32              `bson:"__v,omitempty"`
}
