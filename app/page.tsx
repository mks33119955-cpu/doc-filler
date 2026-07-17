'use client';
import FillerForm from './components/FillerForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
            📄 Генератор документов
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Заполните форму и скачайте готовый PDF
          </p>
          <FillerForm />
        </div>
      </div>
    </div>
  );
}
