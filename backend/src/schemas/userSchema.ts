export const loginSchema = {
    body:{
        type:"object",
        required: ["username","password"],
        properties:{
            username:{type:"string", minLength: 3},
            password:{type: "string", minLength: 6}
        }
    } 
}

export const createUserSchema = {
    body:{
        type:"object",
        required: ["username","password","phone"],
        properties:{
            username:{type:"string", minLength: 3},
            password:{type: "string", minLength: 6},
            phone:{type:"string", minLength: 10}
        }
    } 
}

export const resetPasswordSchema = {
    body: {
        type: "object",
        required: ["newPassword"],
        properties: {
            newPassword: { type: "string", minLength: 6 }
        }
    }
}