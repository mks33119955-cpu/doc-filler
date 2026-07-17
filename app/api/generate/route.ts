import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, HeightRule } from 'docx';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export async function POST(request: Request) {
  try {
    const { fields } = await request.json();

    // Читаем шаблон DOCX
    const templatePath = path.join(process.cwd(), 'app/templates/dogovor-zayavka.docx');
    
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: 'Шаблон не найден!' }, { status: 404 });
    }

    // Создаем новый документ на основе шаблона
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Заголовок
          new Paragraph({
            children: [
              new TextRun({
                text: 'ООО «ТК ГРУЗОВАЯ КОМПАНИЯ»',
                size: 24,
                bold: true,
                font: 'Times New Roman',
              }),
            ],
            alignment: 'center',
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Юридический Адрес: УЛИЦА НЕКРАСОВА, Д. 65, КВ./ОФ. КВ. 36, НОВОСИБИРСКАЯ ОБЛАСТЬ, Г. НОВОСИБИРСК',
                size: 20,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `ДОГОВОР-ЗАЯВКА № ${fields.НомерДоговора || '______'}`,
                size: 28,
                bold: true,
                font: 'Times New Roman',
              }),
            ],
            alignment: 'center',
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `от «${fields.ДатаДоговора || '______'}» 2026г.`,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
            alignment: 'center',
          }),
          new Paragraph({ children: [new TextRun({ text: '', size: 12 })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Общество с ограниченной ответственностью «ТК Грузовая компания», именуемый в дальнейшем "Перевозчик", в лице директора действующий на основании Устава, с одной стороны и Общество с ограниченной ответственностью "${fields.Заказчик || '____________'}", именуемое в дальнейшем "Заказчик", в лице директора ${fields.Директор || '__________'}, действующего на основании Устава с другой стороны, заключили договор о нижеследующем:`,
                size: 22,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({ children: [new TextRun({ text: '', size: 12 })] }),
          
          // ТАБЛИЦА с данными
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Ответственный за перевозку со стороны Заказчика', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.Ответственный || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Маршрут перевозки', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.Маршрут || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Дата и время подачи авто под загрузку', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.ДатаПодачи || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Адрес места загрузки', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.АдресЗагрузки || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Наименование груза', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.НаименованиеГруза || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Стоимость груза', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.СтоимостьГруза || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Параметры грузовых мест', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.РазмерыГруза || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Дата доставки груза получателю', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.ДатаДоставки || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Получатель груза', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.Получатель || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Адрес места разгрузки', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.АдресРазгрузки || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Данные автотранспорта', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.Автотранспорт || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Стоимость перевозки и срок оплаты', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.СтоимостьПеревозки || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Водитель', size: 20, bold: true })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: fields.Водитель || '__________________', size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),
          
          new Paragraph({ children: [new TextRun({ text: '', size: 12 })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: '1. Данный договор-заявка является разовым и имеет полную юридическую силу. С чем согласны обе стороны.',
                size: 22,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '2. По согласованному сторонами договору-заявке "Перевозчик" обязан обеспечить подачу исправного транспортного средства к месту погрузки во время, указанное в заявке.',
                size: 22,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '3. За порчу, либо утрату груза, произошедшую по вине "Перевозчика" в процессе перевозки, "Перевозчик" несет полную материальную ответственность.',
                size: 22,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '4. "Заказчик" обязуется произвести оплату за оказанную перевозку груза в сроки и размере согласованные сторонами.',
                size: 22,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '5. За несвоевременную оплату перевозки "Заказчик" обязан оплатить пени в размере 0,5% от стоимости перевозки за каждый день просрочки.',
                size: 22,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({ children: [new TextRun({ text: '', size: 12 })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'РЕКВИЗИТЫ И ПОДПИСИ СТОРОН',
                size: 24,
                bold: true,
                font: 'Times New Roman',
              }),
            ],
            alignment: 'center',
          }),
          new Paragraph({ children: [new TextRun({ text: '', size: 12 })] }),
          
          // Подписи
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'Перевозчик', size: 20, bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: 'ООО «ТК Грузовая Компания»', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'ИНН: 5406820437', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'КПП: 540601001', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Директор: Пестов В.В.', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: '', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: '___________', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'М.П.', size: 18 })] }),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'Заказчик', size: 20, bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: fields.Заказчик || '__________________', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Директор: ' + (fields.Директор || '__________________'), size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: '', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: '___________', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'М.П.', size: 18 })] }),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    // Генерируем DOCX
    const docxBuffer = await Packer.toBuffer(doc);

    // Конвертируем DOCX в PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    const font = await pdfDoc.embedFont('Helvetica');
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    // Транслитерируем русский текст для PDF
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
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      };
      return text.replace(/[А-Яа-яЁё]/g, (char) => map[char] || char);
    }

    // Простой текст для PDF (без таблиц, но с данными)
    const textContent = `ДОГОВОР-ЗАЯВКА № ${fields.НомерДоговора || '______'}
от «${fields.ДатаДоговора || '______'}» 2026г.

Заказчик: ${fields.Заказчик || '__________________'}
Директор: ${fields.Директор || '__________________'}

Маршрут перевозки: ${fields.Маршрут || '__________________'}
Дата и время подачи авто: ${fields.ДатаПодачи || '__________________'}
Адрес загрузки: ${fields.АдресЗагрузки || '__________________'}
Наименование груза: ${fields.НаименованиеГруза || '__________________'}
Стоимость груза: ${fields.СтоимостьГруза || '__________________'} руб.
Параметры грузовых мест: ${fields.РазмерыГруза || '__________________'}
Дата доставки: ${fields.ДатаДоставки || '__________________'}
Получатель: ${fields.Получатель || '__________________'}
Адрес разгрузки: ${fields.АдресРазгрузки || '__________________'}
Стоимость перевозки: ${fields.СтоимостьПеревозки || '__________________'}
Водитель: ${fields.Водитель || '__________________'}

ПОДПИСИ СТОРОН:
Перевозчик: ООО «ТК Грузовая Компания»
Директор: Пестов В.В.

Заказчик: ${fields.Заказчик || '__________________'}
Директор: ${fields.Директор || '__________________'}`;

    const lines = textContent.split('\n');
    let y = height - 50;

    for (const line of lines) {
      if (y < 50) {
        const newPage = pdfDoc.addPage([595, 842]);
        y = height - 50;
      }

      try {
        const displayText = transliterate(line);
        page.drawText(displayText, {
          x: 50,
          y: y,
          size: 11,
          font: font,
          maxWidth: width - 100,
        });
      } catch (error) {
        console.error('Ошибка отображения:', error);
      }
      y -= 20;
    }

    const pdfBytes = await pdfDoc.save();

    // Возвращаем PDF
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
