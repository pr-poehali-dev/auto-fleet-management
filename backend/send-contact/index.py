"""
Отправка контактной формы с вложениями на email ddmaxi-srs@yandex.ru v2
"""
import json
import os
import smtplib
import base64
import traceback
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
    """Отправляет заявку с вложениями на почту ddmaxi-srs@yandex.ru"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    try:
        body = json.loads(event.get('body') or '{}')
    except Exception:
        body = {}

    name = body.get('name', '').strip()
    phone = body.get('phone', '').strip()
    email = body.get('email', '').strip()
    message = body.get('message', '').strip()
    files = body.get('files', [])

    if not name or not phone or not message:
        return {
            'statusCode': 400,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Заполните обязательные поля: ФИО, телефон, сообщение'}),
        }

    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    if not smtp_password:
        print('ERROR: SMTP_PASSWORD secret is empty')
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Почта не настроена. Обратитесь к администратору.'}),
        }

    msg = MIMEMultipart()
    msg['From'] = FROM_EMAIL
    msg['To'] = TO_EMAIL
    msg['Subject'] = f'=?utf-8?b?{base64.b64encode(f"Новая заявка от {name}".encode()).decode()}?='

    html_body = f"""
    <h2 style="color:#333">Новая заявка с сайта</h2>
    <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif">
      <tr><td style="padding:10px 12px;font-weight:bold;background:#f0f0f0;border:1px solid #ddd;width:140px">ФИО</td><td style="padding:10px 12px;border:1px solid #ddd">{name}</td></tr>
      <tr><td style="padding:10px 12px;font-weight:bold;background:#f0f0f0;border:1px solid #ddd">Телефон</td><td style="padding:10px 12px;border:1px solid #ddd">{phone}</td></tr>
      <tr><td style="padding:10px 12px;font-weight:bold;background:#f0f0f0;border:1px solid #ddd">Email</td><td style="padding:10px 12px;border:1px solid #ddd">{email or '<i>не указан</i>'}</td></tr>
      <tr><td style="padding:10px 12px;font-weight:bold;background:#f0f0f0;border:1px solid #ddd;vertical-align:top">Сообщение</td><td style="padding:10px 12px;border:1px solid #ddd">{message.replace(chr(10), '<br>')}</td></tr>
    </table>
    {'<p style="color:#888;margin-top:12px">Вложений: ' + str(len(files)) + ' файл(ов)</p>' if files else ''}
    """
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    for f in files:
        file_name = f.get('name', 'file')
        file_type = f.get('type', 'application/octet-stream')
        file_data_b64 = f.get('data', '')

        if not file_data_b64:
            continue

        if ',' in file_data_b64:
            file_data_b64 = file_data_b64.split(',', 1)[1]

        try:
            file_bytes = base64.b64decode(file_data_b64)
        except Exception:
            print(f'ERROR: cannot decode file {file_name}')
            continue

        mime_main, mime_sub = (file_type.split('/', 1) if '/' in file_type else ('application', 'octet-stream'))
        part = MIMEBase(mime_main, mime_sub)
        part.set_payload(file_bytes)
        encoders.encode_base64(part)
        encoded_name = f'=?utf-8?b?{base64.b64encode(file_name.encode()).decode()}?='
        part.add_header('Content-Disposition', 'attachment', filename=encoded_name)
        msg.attach(part)

    try:
        print(f'Connecting to {SMTP_HOST}:{SMTP_PORT}...')
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(FROM_EMAIL, smtp_password)
            server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_bytes())
        print(f'Email sent successfully to {TO_EMAIL}')
    except smtplib.SMTPAuthenticationError as e:
        print(f'SMTP AUTH ERROR: {e}')
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Ошибка авторизации почты. Проверьте пароль приложения Яндекс.'}),
        }
    except Exception as e:
        print(f'SMTP ERROR: {e}')
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': f'Ошибка отправки: {str(e)}'}),
        }

    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({'success': True, 'message': 'Сообщение отправлено'}),
    }