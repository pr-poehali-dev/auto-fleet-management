import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для управления автопарком AutoFleet Pro"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        conn.set_session(autocommit=True)
        cur = conn.cursor()
        
        path = event.get('params', {}).get('path', '')
        
        if method == 'GET' and path == 'vehicles':
            cur.execute("""
                SELECT vehicle_id, brand, status, fuel_level, location, driver_name, mileage_today 
                FROM vehicles 
                ORDER BY created_at DESC
            """)
            rows = cur.fetchall()
            vehicles = []
            for row in rows:
                vehicles.append({
                    'id': row[0],
                    'brand': row[1],
                    'status': row[2],
                    'fuel': row[3],
                    'location': row[4],
                    'driver': row[5] or '—',
                    'mileage': f"{row[6]} км"
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'vehicles': vehicles}),
                'isBase64Encoded': False
            }
        
        if method == 'GET' and path == 'drivers':
            cur.execute("""
                SELECT name, phone, rating, trips, efficiency, status 
                FROM drivers 
                ORDER BY created_at DESC
            """)
            rows = cur.fetchall()
            drivers = []
            for row in rows:
                drivers.append({
                    'name': row[0],
                    'phone': row[1],
                    'rating': float(row[2]),
                    'trips': row[3],
                    'efficiency': row[4],
                    'status': row[5]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'drivers': drivers}),
                'isBase64Encoded': False
            }
        
        if method == 'GET' and path == 'maintenance':
            cur.execute("""
                SELECT vehicle_id, maintenance_type, scheduled_date, status 
                FROM maintenance_schedule 
                ORDER BY scheduled_date ASC
            """)
            rows = cur.fetchall()
            schedule = []
            for row in rows:
                date_obj = row[2]
                if date_obj == datetime.now().date():
                    date_str = 'Сегодня'
                else:
                    date_str = date_obj.strftime('%d %B')
                
                schedule.append({
                    'vehicle': row[0],
                    'type': row[1],
                    'date': date_str,
                    'status': row[3]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'schedule': schedule}),
                'isBase64Encoded': False
            }
        
        if method == 'GET' and path == 'notifications':
            cur.execute("""
                SELECT type, title, message, severity 
                FROM notifications 
                WHERE is_read = FALSE 
                ORDER BY created_at DESC 
                LIMIT 10
            """)
            rows = cur.fetchall()
            notifications = []
            for row in rows:
                notifications.append({
                    'type': row[0],
                    'title': row[1],
                    'message': row[2],
                    'severity': row[3]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'notifications': notifications}),
                'isBase64Encoded': False
            }
        
        if method == 'POST' and path == 'vehicles':
            body = json.loads(event.get('body', '{}'))
            vehicle_id = body.get('vehicle_id')
            brand = body.get('brand')
            location = body.get('location')
            driver_name = body.get('driver_name', '—')
            status = body.get('status', 'active')
            
            if not vehicle_id or not brand or not location:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO vehicles (vehicle_id, brand, location, driver_name, status) 
                VALUES (%s, %s, %s, %s, %s)
            """, (vehicle_id, brand, location, driver_name, status))
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'Vehicle added'}),
                'isBase64Encoded': False
            }
        
        if method == 'POST' and path == 'drivers':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            phone = body.get('phone')
            license = body.get('license')
            experience = body.get('experience', 0)
            
            if not name or not phone or not license:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO drivers (name, phone, license, experience) 
                VALUES (%s, %s, %s, %s)
            """, (name, phone, license, experience))
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'Driver added'}),
                'isBase64Encoded': False
            }
        
        if method == 'GET' and path == 'stats':
            cur.execute("SELECT COUNT(*) FROM vehicles WHERE status = 'active'")
            active_vehicles = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM drivers WHERE status = 'active'")
            active_drivers = cur.fetchone()[0]
            
            cur.execute("SELECT SUM(mileage_today) FROM vehicles")
            total_mileage = cur.fetchone()[0] or 0
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'active_vehicles': active_vehicles,
                    'active_drivers': active_drivers,
                    'total_mileage': total_mileage
                }),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Endpoint not found'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
