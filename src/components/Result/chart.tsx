import { Bar, Pie, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Chart() {
    const satisfactionData = {
        labels: ["Sangat Puas", "Puas", "Cukup Puas", "Tidak Puas", "Sangat Tidak Puas"],
        datasets: [
            {
                label: "Tingkat Kepuasan",
                data: [50, 30, 10, 7, 3],
                backgroundColor: [
                    "#7c3aed", 
                    "#a855f7", 
                    "#c084fc", 
                    "#d8b4fe", 
                    "#ede9fe", 
                ],
                borderRadius: 8,
            },
        ],
    };

    const featureData = {
        labels: ["Kemudahan", "Kecepatan", "Dukungan"],
        datasets: [
            {
                label: "Fitur Favorit",
                data: [40, 25, 15],
                backgroundColor: "#a855f7",
            },
        ],
    };

    const lineData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "Mei"],
        datasets: [
            {
                label: "Respon Masuk per Bulan",
                data: [5, 15, 20, 40, 60],
                fill: false,
                borderColor: "#7c3aed",
                tension: 0.3,
            },
        ],
    };

    return (
        <div className="flex flex-col items-center min-h-screen py-10 bg-gray-50">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
                Hasil Kuesioner
            </h1>
        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Tingkat Kepuasan</h2>
                    <Bar data={satisfactionData} />
                </div>
        
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Fitur Favorit</h2>
                    <div className="w-60 h-60 mx-auto">
                        <Pie data={featureData} />
                    </div>
                </div>
        
                <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Respon per Bulan</h2>
                    <Line data={lineData} />
                </div>
            </div>
        </div>
    );
}