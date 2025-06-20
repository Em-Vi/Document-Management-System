export const uploadDocumentSchema = {
  body: {
    type: "object",
    required: ["employee_id", "Category", "file"],
    properties: {
      employee_id: { type: "string", minLength: 1 },
      Category: { type: "string", minLength: 1 },
      other_type: {
        type: "string",
        minLength: 1,
        maxLength: 30,
        pattern: "^[a-zA-Z0-9 .,'-]+$", // allow alphanumeric and common punctuation
        errorMessage: {
          minLength: "Other type must not be empty",
          maxLength: "Other type must be at most 30 characters",
          pattern: "Other type contains invalid characters"
        }
      },
      file: {
        type: "object",
        required: ["originalname", "mimetypes"],
        properties: {
          originalname: { type: "string" },
          mimetypes: { type: "string" }
        }
      }
    },
    if: {
      properties: { Category: { const: "OTH-Others" } }
    },
    then: {
      required: ["other_type"]
    }
  }
};


export const addDocumentCategorySchema = {
  body: {
    type: "object",
    required: ["employeeId", "category"],
    properties: {
      employeeId: { type: "string", minLength: 1 },
      category: { type: "string", minLength: 1 }
    }
  }
};



export default {
  uploadDocumentSchema,
  addDocumentCategorySchema
};