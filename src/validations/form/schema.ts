import * as yup from "yup";

export const threatSchema = yup.object({
    biaya_pengetahuan: yup
        .number()
        .required("Biaya pengetahuan wajib diisi")
        .min(0, "Tidak boleh kurang dari 0"),
    pengaruh_kerugian: yup
        .number()
        .required("Pengaruh kerugian wajib diisi")
        .min(0, "Tidak boleh kurang dari 0"),
    frekuensi_serangan: yup
        .number()
        .required("Frekuensi serangan wajib diisi")
        .min(0, "Tidak boleh kurang dari 0"),
    pemulihan: yup
        .number()
        .required("Pemulihan wajib diisi")
        .min(0, "Tidak boleh kurang dari 0"),
    mengerti_poin: yup.boolean().required("Harus memilih apakah mengerti atau tidak"),
    tidak_mengerti: yup.string().when("mengerti_poin", {
        is: (value: unknown) => value === false,
        then: (schema) => schema.required("Harus menjelaskan ketidakmengertian"),
        otherwise: (schema) => schema.notRequired(),
    }),
    tidak_mengerti_description: yup.string().when("mengerti_poin", {
        is: (value: unknown) => value === false, 
        then: (schema) => schema.required("Deskripsi ketidakmengertian wajib diisi"),
        otherwise: (schema) => schema.notRequired(),
    }),

});

export const submissionSchema = yup.object({
    threats: yup.array().of(threatSchema).min(1, "Minimal harus ada satu ancaman").required("Threads wajib diisi"),
});