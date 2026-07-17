import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { fields } = await request.json();

    // Создаем PDF документ
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Загружаем русский шрифт
    let font;
    try {
      // Путь к шрифту в проекте
      const fontPath = path.join(process.cwd(), 'public/fonts/times.ttf');
      
      console.log('Поиск шрифта по пути:', fontPath);
      
      if (fs.existsSync(fontPath)) {
        const fontBytes = fs.readFileSync(fontPath);
        font = await pdfDoc.embedFont(fontBytes);
        console.log('✅ Русский шрифт загружен успешно!');
      } else {
        console.log('⚠️ Шрифт не найден, используем стандартный');
        font = await pdfDoc.embedFont('Helvetica');
      }
    } catch (error) {
      console.error('Ошибка загрузки шрифта:', error);
      font = await pdfDoc.embedFont('Helvetica');
    }

    // Создаем страницу A4
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    // Формируем текст документа
    const lines = [
      { text: 'ДОГОВОР-ЗАЯВКА № ' + (fields.НомерДоговора || ''), size: 16, align: 'center' },
      { text: 'от «' + (fields.ДатаДоговора || '') + '» 2026г.', size: 14, align: 'center' },
      { text: '', size: 0 },
      { text: 'Заказчик: ' + (fields.Заказчик || ''), size: 12, align: 'left' },
      { text: 'Директор: ' + (fields.Директор || ''), size: 12, align: 'left' },
      { text: '', size: 0 },
      { text: 'МАРШРУТ ПЕРЕВОЗКИ:', size: 14, align: 'left' },
      { text: 'Дата и время подачи авто под загрузку: ' + (fields.ДатаПодачи || ''), size: 12, align: 'left' },
      { text: 'Адрес места загрузки: ' + (fields.АдресЗагрузки || ''), size: 12, align: 'left' },
      { text: 'Наименование груза: ' + (fields.НаименованиеГруза || ''), size: 12, align: 'left' },
      { text: 'Стоимость груза: ' + (fields.СтоимостьГруза || '') + ' руб.', size: 12, align: 'left' },
      { text: 'Параметры грузовых мест: ' + (fields.РазмерыГруза || ''), size: 12, align: 'left' },
      { text: 'Дата доставки груза получателю: ' + (fields.ДатаДоставки || ''), size: 12, align: 'left' },
      { text: 'Получатель груза: ' + (fields.Получатель || ''), size: 12, align: 'left' },
      { text: 'Адрес места разгрузки: ' + (fields.АдресРазгрузки || ''), size: 12, align: 'left' },
      { text: '', size: 0 },
      { text: 'Стоимость перевозки и срок оплаты: ' + (fields.СтоимостьПеревозки || ''), size: 12, align: 'left' },
      { text: 'Водитель: ' + (fields.Водитель || ''), size: 12, align: 'left' },
      { text: '', size: 0 },
      { text: '', size: 0 },
      { text: 'ПОДПИСИ СТОРОН:', size: 14, align: 'left' },
      { text: 'Перевозчик: ООО «ТК Грузовая Компания»', size: 12, align: 'left' },
      { text: 'Директор: Пестов В.В.', size: 12, align: 'left' },
      { text: '', size: 0 },
      { text: 'Заказчик: ' + (fields.Заказчик || ''), size: 12, align: 'left' },
      { text: 'Директор: ' + (fields.Директор || ''), size: 12, align: 'left' },
    ];

    let y = height - 50;

    // Рисуем каждую строку
    for (const line of lines) {
      if (line.text === '') {
        y -= 20;
        continue;
      }

      // Если места мало - создаем новую страницу
      if (y < 50) {
        const newPage = pdfDoc.addPage([595, 842]);
        y = height - 50;
      }

      let x = 50;
      if (line.align === 'center') {
        try {
          const textWidth = font.widthOfTextAtSize(line.text, line.size);
          x = (width - textWidth) / 2;
        } catch {
          x = 50;
        }
      }

      try {
        // Рисуем текст с русским шрифтом
        page.drawText(line.text, {
          x: x,
          y: y,
          size: line.size,
          font: font,
          maxWidth: width - 100,
        });
      } catch (error) {
        console.error('Ошибка при отображении текста:', line.text);
        // Пробуем отобразить без шрифта
        try {
          page.drawText(line.text, {
            x: x,
            y: y,
            size: line.size,
            font: await pdfDoc.embedFont('Helvetica'),
            maxWidth: width - 100,
          });
        } catch (e) {
          console.error('Не удалось отобразить текст:', line.text);
        }
      }

      y -= line.size > 14 ? 30 : 22;
    }

    // Сохраняем PDF
    const pdfBytes = await pdfDoc.save();

    // Возвращаем файл
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Договор-Заявка-${fields.НомерДоговора || 'заполненный'}.pdf`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Ошибка:', error);
    return NextResponse.json(
      { error: 'Ошибка генерации: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
