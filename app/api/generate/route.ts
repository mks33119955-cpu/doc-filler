import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export async function POST(request: Request) {
  try {
    const { fields } = await request.json();

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont('Helvetica');

    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    const textLines = [
      ['ДОГОВОР-ЗАЯВКА № ' + (fields.НомерДоговора || ''), 'center', 16],
      ['от «' + (fields.ДатаДоговора || '') + '» 2026г.', 'center', 14],
      ['', 'left', 0],
      ['Заказчик: ' + (fields.Заказчик || ''), 'left', 12],
      ['Директор: ' + (fields.Директор || ''), 'left', 12],
      ['', 'left', 0],
      ['МАРШРУТ ПЕРЕВОЗКИ:', 'left', 14],
      ['Дата и время подачи авто под загрузку: ' + (fields.ДатаПодачи || ''), 'left', 12],
      ['Адрес места загрузки: ' + (fields.АдресЗагрузки || ''), 'left', 12],
      ['Наименование груза: ' + (fields.НаименованиеГруза || ''), 'left', 12],
      ['Стоимость груза: ' + (fields.СтоимостьГруза || '') + ' руб.', 'left', 12],
      ['Параметры грузовых мест: ' + (fields.РазмерыГруза || ''), 'left', 12],
      ['Дата доставки груза получателю: ' + (fields.ДатаДоставки || ''), 'left', 12],
      ['Получатель груза: ' + (fields.Получатель || ''), 'left', 12],
      ['Адрес места разгрузки: ' + (fields.АдресРазгрузки || ''), 'left', 12],
      ['', 'left', 0],
      ['Стоимость перевозки и срок оплаты: ' + (fields.СтоимостьПеревозки || ''), 'left', 12],
      ['Водитель: ' + (fields.Водитель || ''), 'left', 12],
      ['', 'left', 0],
      ['', 'left', 0],
      ['ПОДПИСИ СТОРОН:', 'left', 14],
      ['Перевозчик: ООО «ТК Грузовая Компания»', 'left', 12],
      ['Директор: Пестов В.В.', 'left', 12],
      ['', 'left', 0],
      ['Заказчик: ' + (fields.Заказчик || ''), 'left', 12],
      ['Директор: ' + (fields.Директор || ''), 'left', 12],
    ];

    let y = height - 50;

    textLines.forEach(([text, align, size]) => {
      if (y < 50) {
        const newPage = pdfDoc.addPage([595, 842]);
        y = height - 50;
      }

      let x = 50;
      if (align === 'center') {
        const textWidth = font.widthOfTextAtSize(text, size);
        x = (width - textWidth) / 2;
      }

      if (text) {
        page.drawText(text, {
          x: x,
          y: y,
          size: size,
          font: font,
          maxWidth: width - 100,
        });
      }
      y -= size > 14 ? 30 : 22;
    });

    const pdfBytes = await pdfDoc.save();

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
