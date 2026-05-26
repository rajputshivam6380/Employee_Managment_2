import * as Yup from "yup";

export const employeeValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .max(15, "Name must be at max 15 characters")
    .required("Name is required"),

  email: Yup.string().email("Invalid email").required("Email is required"),

  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),

  country_code: Yup.string().required("Country code is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(10, "Password must be at max 10 characters")
    .required("Password is required"),

  role: Yup.string().required("Role is required"),
});
