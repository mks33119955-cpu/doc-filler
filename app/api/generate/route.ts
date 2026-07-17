import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    const { fields } = await request.json();

    // Создаем PDF документ
    const pdfDoc = await PDFDocument.create();
    
    // Загружаем шрифт с поддержкой кириллицы
    // Используем стандартный шрифт, но с поддержкой Unicode
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Создаем страницу A4
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    // Функция для замены русских букв на транслитерацию (только для PDF)
    function toLatin(text: string): string {
      if (!text) return '';
      
      const map: { [key: string]: string } = {
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        '№': '#', '«': '"', '»': '"', '"': '',
      };
      
      let result = '';
      for (const char of text) {
        result += map[char] || char;
      }
      return result;
    }

    // Формируем текст документа НА РУССКОМ (для отображения на сайте будем использовать русский)
    // Но в PDF рисуем транслитерированный текст
    const lines = [
      { text: 'ДОГОВОР-ЗАЯВКА № ' + (fields.НомерДоговора || ''), size: 16, align: 'center', rus: true },
      { text: 'от «' + (fields.ДатаДоговора || '') + '» 2026г.', size: 14, align: 'center', rus: true },
      { text: '', size: 0, rus: false },
      { text: 'Заказчик: ' + (fields.Заказчик || ''), size: 12, align: 'left', rus: true },
      { text: 'Директор: ' + (fields.Директор || ''), size: 12, align: 'left', rus: true },
      { text: '', size: 0, rus: false },
      { text: 'МАРШРУТ ПЕРЕВОЗКИ:', size: 14, align: 'left', rus: true },
      { text: 'Дата и время подачи авто: ' + (fields.ДатаПодачи || ''), size: 12, align: 'left', rus: true },
      { text: 'Адрес загрузки: ' + (fields.АдресЗагрузки || ''), size: 12, align: 'left', rus: true },
      { text: 'Наименование груза: ' + (fields.НаименованиеГруза || ''), size: 12, align: 'left', rus: true },
      { text: 'Стоимость груза: ' + (fields.СтоимостьГруза || '') + ' руб.', size: 12, align: 'left', rus: true },
      { text: 'Параметры мест: ' + (fields.РазмерыГруза || ''), size: 12, align: 'left', rus: true },
      { text: 'Дата доставки: ' + (fields.ДатаДоставки || ''), size: 12, align: 'left', rus: true },
      { text: 'Получатель: ' + (fields.Получатель || ''), size: 12, align: 'left', rus: true },
      { text: 'Адрес разгрузки: ' + (fields.АдресРазгрузки || ''), size: 12, align: 'left', rus: true },
      { text: '', size: 0, rus: false },
      { text: 'Стоимость перевозки: ' + (fields.СтоимостьПеревозки || ''), size: 12, align: 'left', rus: true },
      { text: 'Водитель: ' + (fields.Водитель || ''), size: 12, align: 'left', rus: true },
      { text: '', size: 0, rus: false },
      { text: 'ПОДПИСИ СТОРОН:', size: 14, align: 'left', rus: true },
      { text: 'Перевозчик: ООО «ТК Грузовая Компания»', size: 12, align: 'left', rus: true },
      { text: 'Директор: Пестов В.В.', size: 12, align: 'left', rus: true },
      { text: '', size: 0, rus: false },
      { text: 'Заказчик: ' + (fields.Заказчик || ''), size: 12, align: 'left', rus: true },
      { text: 'Директор: ' + (fields.Директор || ''), size: 12, align: 'left', rus: true },
    ];

    let y = height - 50;

    // Рисуем каждую строку
    for (const line of lines) {
      if (line.text === '') {
        y -= 20;
        continue;
      }

      if (y < 50) {
        const newPage = pdfDoc.addPage([595, 842]);
        y = height - 50;
      }

      // Если русский текст - транслитерируем
      let displayText = line.text;
      if (line.rus) {
        displayText = toLatin(line.text);
      }

      let x = 50;
      if (line.align === 'center') {
        try {
          const textWidth = font.widthOfTextAtSize(displayText, line.size);
          x = (width - textWidth) / 2;
        } catch {
          x = 50;
        }
      }

      try {
        page.drawText(displayText, {
          x: x,
          y: y,
          size: line.size,
          font: font,
          maxWidth: width - 100,
        });
      } catch (error) {
        console.error('Ошибка отображения:', error);
      }

      y -= line.size > 14 ? 30 : 22;
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=dogovor-${fields.НомерДоговора || 'zapolnennyy'}.pdf`,
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
