import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    const { fields } = await request.json();

    // Создаем PDF документ
    const pdfDoc = await PDFDocument.create();
    
    // Используем встроенный шрифт Helvetica
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Создаем страницу A4
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    // Функция для безопасного отображения текста (транслитерация)
    function transliterate(text: string): string {
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
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      
      return text.replace(/[А-Яа-яЁё]/g, (char) => map[char] || char);
    }

    // Формируем текст документа (с транслитерацией)
    const lines = [
      { text: 'DOGOVOR-ZAYAVKA № ' + (fields.НомерДоговора || ''), size: 16, align: 'center' },
      { text: 'ot «' + (fields.ДатаДоговора || '') + '» 2026g.', size: 14, align: 'center' },
      { text: '', size: 0 },
      { text: 'Zakazchik: ' + transliterate(fields.Заказчик || ''), size: 12, align: 'left' },
      { text: 'Direktor: ' + transliterate(fields.Директор || ''), size: 12, align: 'left' },
      { text: '', size: 0 },
      { text: 'MARShRUT PEREVOZKI:', size: 14, align: 'left' },
      { text: 'Data i vremya podachi avto pod zagruzku: ' + (fields.ДатаПодачи || ''), size: 12, align: 'left' },
      { text: 'Adres mesta zagruzki: ' + transliterate(fields.АдресЗагрузки || ''), size: 12, align: 'left' },
      { text: 'Naimenovanie gruza: ' + transliterate(fields.НаименованиеГруза || ''), size: 12, align: 'left' },
      { text: 'Stoimost gruza: ' + (fields.СтоимостьГруза || '') + ' rub.', size: 12, align: 'left' },
      { text: 'Parametry gruzovyh mest: ' + transliterate(fields.РазмерыГруза || ''), size: 12, align: 'left' },
      { text: 'Data dostavki gruza poluchatelyu: ' + (fields.ДатаДоставки || ''), size: 12, align: 'left' },
      { text: 'Poluchatel gruza: ' + transliterate(fields.Получатель || ''), size: 12, align: 'left' },
      { text: 'Adres mesta razgruzki: ' + transliterate(fields.АдресРазгрузки || ''), size: 12, align: 'left' },
      { text: '', size: 0 },
      { text: 'Stoimost perevozki i srok oplaty: ' + transliterate(fields.СтоимостьПеревозки || ''), size: 12, align: 'left' },
      { text: 'Voditel: ' + transliterate(fields.Водитель || ''), size: 12, align: 'left' },
      { text: '', size: 0 },
      { text: 'PODPISI STORON:', size: 14, align: 'left' },
      { text: 'Perevozchik: OOO "TK Gruzovaya Kompaniya"', size: 12, align: 'left' },
      { text: 'Direktor: Pestov V.V.', size: 12, align: 'left' },
      { text: '', size: 0 },
      { text: 'Zakazchik: ' + transliterate(fields.Заказчик || ''), size: 12, align: 'left' },
      { text: 'Direktor: ' + transliterate(fields.Директор || ''), size: 12, align: 'left' },
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

      let x = 50;
      if (line.align === 'center') {
        const textWidth = font.widthOfTextAtSize(line.text, line.size);
        x = (width - textWidth) / 2;
      }

      page.drawText(line.text, {
        x: x,
        y: y,
        size: line.size,
        font: font,
        maxWidth: width - 100,
      });

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
