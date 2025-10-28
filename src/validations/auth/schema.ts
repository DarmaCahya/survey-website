import * as yup from "yup";

export const loginSchema = yup.object({
    email: yup.string().email("Email tidak valid").required("Email wajib diisi"),
    password: yup.string().required("Password wajib diisi"),
});

export const registerSchema = yup.object({
    name: yup
        .string()
        .required("Nama wajib diisi")
        .min(4, "Nama minimal 4 karakter")
        .max(50, "Nama maksimal 50 karakter"),

    email: yup
        .string()
        .required("Email wajib diisi")
        .email("Format email tidak valid"),
    password: yup
        .string()
        .required("Password wajib diisi")
        .min(6, "Password harus memiliki minimal 6 karakter")
        .matches(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
        .matches(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
        .matches(/\d/, "Password harus mengandung minimal 1 angka")
        .matches(/[@$!%*?&]/, "Password harus mengandung minimal 1 simbol (@, $, !, %, *, ?, &)"),
    confirmPassword: yup
        .string()
        .required("Konfirmasi password wajib diisi")
        .oneOf([yup.ref("password")], "Password tidak cocok"),
});