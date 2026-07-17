'use client';
import { useState } from 'react';

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'date' | 'number';
}

export default function FillerForm() {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  const fieldConfigs: FieldConfig[] = [
    { key: 'НомерДоговора', label: 'Номер договора', placeholder: 'Например: 123/2026' },
    { key: 'ДатаДоговора', label: 'Дата договора', placeholder: 'Например: 17.07.2026', type: 'date' },
    { key: 'Заказчик', label: 'Наименование Заказчика', placeholder: 'ООО "Ромашка"' },
    { key: 'Директор', label: 'ФИО Директора', placeholder: 'Иванов И.И.' },
    { key: 'ДатаПодачи', label: 'Дата и время подачи авто', placeholder: '18.07.2026 09:00' },
    { key: 'АдресЗагрузки', label: 'Адрес места загрузки', placeholder: 'г. Новосибирск, ул. Ленина 1' },
    { key: 'НаименованиеГруза', label: 'Наименование груза', placeholder: 'Запасные части' },
    { key: 'СтоимостьГруза', label: 'Стоимость груза (руб.)', placeholder: '100 000', type: 'number' },
    { key: 'РазмерыГруза', label: 'Параметры грузовых мест', placeholder: '120x80x60 см, 50 кг' },
    { key: 'ДатаДоставки', label: 'Дата доставки груза', placeholder: '20.07.2026', type: 'date' },
    { key: 'Получатель', label: 'Получатель груза', placeholder: 'ООО "Получатель", Петров П.П.' },
    { key: 'АдресРазгрузки', label: 'Адрес места разгрузки', placeholder: 'г. Новосибирск, ул. Светлая 5' },
    { key: 'СтоимостьПеревозки', label: 'Стоимость перевозки', placeholder: '25 000 руб.' },
    { key: 'Водитель', label: 'Водитель', placeholder: 'Сидоров С.С.' },
  ];

  const handleFieldChange = (key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emptyFields = fieldConfigs.filter(f => !fields[f.key]?.trim());
    if (emptyFields.length > 0) {
      alert(`⚠️ Заполните все поля: ${emptyFields.map(f => f.label).join(', ')}`);
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Договор-Заявка-${fields.НомерДоговора || 'заполненный'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } else {
        const error = await response.json();
        alert('❌ Ошибка: ' + (error.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      alert('❌ Ошибка генерации документа');
    }
    setGenerating(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fieldConfigs.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} <span className="text-red-500">*</span>
            </label>
            <input
              type={field.type || 'text'}
              value={fields[field.key] || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={generating}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all text-lg font-semibold shadow-lg hover:shadow-xl"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Генерация...
          </span>
        ) : (
          '📄 Скачать заполненный PDF'
        )}
      </button>
    </form>
  );
}
