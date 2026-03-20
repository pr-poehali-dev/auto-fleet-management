"""
Отправка контактной формы. Файлы загружаются в S3, ссылки вкладываются в письмо.
"""
import json
import os
import smtplib
import base64
import traceback
import uuid
import boto3
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

TO_EMAIL = 'ddmaxi-srs@yandex.ru'
FROM_EMAIL = 'ddmaxi-srs@yandex.ru'
SMTP_HOST = 'smtp.yandex.ru'
SMTP_PORT = 465


def upload_file_to_s3(file_name: str, file_type: str, file_data_b64: str) -> str:
    """Загружает файл в S3 и возвращает CDN-ссылку"""
    if ',' in file_data_b64:
        file_data_b64 = file_data_b64.split(',', 1)[1]
    file_bytes = base64.b64decode(file_data_b64)

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

    key = f'contacts/{uuid.uuid4().hex}/{file_name}'
    s3.put_object(Bucket='files', Key=key, Body=file_bytes, ContentType=file_type or 'application/octet-stream')
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    print(f'Uploaded {file_name} -> {cdn_url}')
    return cdn_url


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

    now = datetime.now().strftime('%d.%m.%Y %H:%M')

    # Загружаем файлы в S3 и собираем ссылки
    file_links = []
    for f in files:
        file_name = f.get('name', 'file')
        file_type = f.get('type', 'application/octet-stream')
        file_data_b64 = f.get('data', '')
        if not file_data_b64:
            continue
        try:
            url = upload_file_to_s3(file_name, file_type, file_data_b64)
            file_links.append({'name': file_name, 'url': url, 'type': file_type})
        except Exception as e:
            print(f'ERROR uploading {file_name}: {e}')

    # Формируем блок файлов для письма
    files_html = ''
    if file_links:
        items = ''.join(
            f'<li style="margin:4px 0"><a href="{fl["url"]}" style="color:#1a73e8">{fl["name"]}</a></li>'
            for fl in file_links
        )
        files_html = f'<h3 style="margin-top:20px">Прикреплённые файлы ({len(file_links)}):</h3><ul>{items}</ul>'

    reply_to = email if email else None
    reply_btn = ''
    if reply_to:
        reply_btn = f'''
        <div style="margin-top:20px">
          <a href="mailto:{reply_to}?subject=Re:%20Ваша%20заявка%20в%20AutoFleet%20Pro"
             style="display:inline-block;padding:10px 20px;background:#1a73e8;color:#fff;text-decoration:none;border-radius:6px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold">
            ✉ Ответить клиенту ({reply_to})
          </a>
        </div>'''

    html_body = f"""
    <h2 style="color:#333;margin-bottom:4px">Новая заявка с сайта</h2>
    <p style="color:#888;font-size:13px;margin-top:0">{now}</p>
    <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;margin-top:12px">
      <tr><td style="padding:10px 12px;font-weight:bold;background:#f0f0f0;border:1px solid #ddd;width:140px">ФИО</td><td style="padding:10px 12px;border:1px solid #ddd">{name}</td></tr>
      <tr><td style="padding:10px 12px;font-weight:bold;background:#f0f0f0;border:1px solid #ddd">Телефон</td><td style="padding:10px 12px;border:1px solid #ddd">{phone}</td></tr>
      <tr><td style="padding:10px 12px;font-weight:bold;background:#f0f0f0;border:1px solid #ddd">Email</td><td style="padding:10px 12px;border:1px solid #ddd">{email or '<i>не указан</i>'}</td></tr>
      <tr><td style="padding:10px 12px;font-weight:bold;background:#f0f0f0;border:1px solid #ddd;vertical-align:top">Сообщение</td><td style="padding:10px 12px;border:1px solid #ddd">{message.replace(chr(10), '<br>')}</td></tr>
    </table>
    {files_html}
    {reply_btn}
    """

    msg = MIMEMultipart()
    msg['From'] = FROM_EMAIL
    msg['To'] = TO_EMAIL
    msg['Subject'] = f'=?utf-8?b?{base64.b64encode(f"Новая заявка от {name}".encode()).decode()}?='
    if reply_to:
        msg['Reply-To'] = reply_to
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    try:
        print(f'Connecting to {SMTP_HOST}:{SMTP_PORT}...')
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(FROM_EMAIL, smtp_password)
            server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_bytes())
        print(f'Email sent to {TO_EMAIL}, files: {len(file_links)}')
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