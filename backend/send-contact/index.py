"""
Отправка контактной формы с вложениями на email ddmaxi-srs@yandex.ru
"""
import json
import os
import smtplib
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

TO_EMAIL = 'ddmaxi-srs@yandex.ru'
FROM_EMAIL = 'ddmaxi-srs@yandex.ru'
SMTP_HOST = 'smtp.yandex.ru'
SMTP_PORT = 465


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    body = json.loads(event.get('body') or '{}')

    name = body.get('name', '').strip()
    phone = body.get('phone', '').strip()
    email = body.get('email', '').strip()
    message = body.get('message', '').strip()
    files = body.get('files', [])  # [{name, type, data (base64)}]

    if not name or not phone or not message:
        return {
            'statusCode': 400,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Заполните обязательные поля: ФИО, телефон, сообщение'}),
        }

    smtp_password = os.environ.get('SMTP_PASSWORD', '')

    msg = MIMEMultipart()
    msg['From'] = FROM_EMAIL
    msg['To'] = TO_EMAIL
    msg['Subject'] = f'Новая заявка от {name}'

    html_body = f"""
    <h2>Новая заявка с сайта</h2>
    <table style="border-collapse:collapse;width:100%">
      <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">ФИО</td><td style="padding:8px">{name}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Телефон</td><td style="padding:8px">{phone}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px">{email or 'не указан'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Сообщение</td><td style="padding:8px">{message}</td></tr>
    </table>
    """
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    # Обрабатываем вложения переданные напрямую (небольшие файлы, base64)
    for f in files:
        file_name = f.get('name', 'file')
        file_type = f.get('type', 'application/octet-stream')
        file_data_b64 = f.get('data', '')

        if not file_data_b64:
            continue

        # Если data — URL (data:image/...;base64,...) — вырезаем
        if ',' in file_data_b64:
            file_data_b64 = file_data_b64.split(',', 1)[1]

        file_bytes = base64.b64decode(file_data_b64)

        part = MIMEBase(*file_type.split('/', 1) if '/' in file_type else ('application', 'octet-stream'))
        part.set_payload(file_bytes)
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', 'attachment', filename=file_name)
        msg.attach(part)

    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
        server.login(FROM_EMAIL, smtp_password)
        server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_string())

    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({'success': True, 'message': 'Сообщение отправлено'}),
    }