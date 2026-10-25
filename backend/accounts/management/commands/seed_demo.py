"""
Fills the database with demo data for testing and presentation.

Run:  python manage.py seed_demo
"""
from datetime import time

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from transport.models import Route, Stop, Bus, Schedule
from passes.models import Payment


ROUTES = [
    ('R1', 'Gulshan Route', [
        ('Nipa Chowrangi', 24.917440, 67.097220),
        ('Gulshan Chowrangi', 24.924150, 67.091730),
        ('Maskan Chowrangi', 24.931090, 67.096560),
        ('NED University', 24.932940, 67.111450),
    ]),
    ('R2', 'Saddar Route', [
        ('Saddar', 24.857150, 67.026850),
        ('Gurumandir', 24.879850, 67.040710),
        ('Hassan Square', 24.903090, 67.078520),
        ('NED University', 24.932940, 67.111450),
    ]),
]


def avatar_svg(initials, colour):
    """Placeholder face photo for demo students (real students upload their own)."""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="360" viewBox="0 0 300 360">'
            f'<rect width="300" height="360" fill="{colour}"/>'
            f'<circle cx="150" cy="140" r="70" fill="#f5e6d8"/>'
            f'<rect x="55" y="230" width="190" height="160" rx="95" fill="#f5e6d8"/>'
            f'<text x="150" y="160" font-family="Arial" font-size="56" font-weight="700" '
            f'text-anchor="middle" fill="{colour}">{initials}</text></svg>').encode()


def receipt_svg(tid, amount):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" fill="#fff"/>'
            f'<text x="20" y="50" font-family="Arial" font-size="22" font-weight="700">JazzCash</text>'
            f'<text x="20" y="90" font-family="Arial" font-size="16">Transaction successful</text>'
            f'<text x="20" y="130" font-family="Arial" font-size="16">Amount: Rs {amount:,}</text>'
            f'<text x="20" y="160" font-family="Arial" font-size="16">TID: {tid}</text>'
            f'<text x="20" y="190" font-family="Arial" font-size="13" fill="#888">Demo receipt</text></svg>').encode()


def make_user(username, password, role, **extra):
    user, created = User.objects.get_or_create(username=username, defaults={'role': role, **extra})
    if created:
        user.set_password(password)
        if role == 'admin':
            user.is_staff = True
            user.is_superuser = True
        user.save()
    return user


class Command(BaseCommand):
    help = 'Create demo users, routes, stops, buses, schedules and an approved fee receipt.'

    def handle(self, *args, **options):
        make_user('admin', 'admin12345', 'admin', first_name='Transport', last_name='Admin')
        driver1 = make_user('driver1', 'driver12345', 'driver', first_name='Aslam', last_name='Khan', phone='03001112233')
        driver2 = make_user('driver2', 'driver12345', 'driver', first_name='Imran', last_name='Ali', phone='03004445566')
        student = make_user('student1', 'student12345', 'student', first_name='Israa', last_name='Ahmed',
                            roll_number='CS-21001', email='student1@example.com')
        student.department = student.department or 'Computer Science'
        if not student.photo:
            student.photo.save('demo-cs-21001.svg', ContentFile(avatar_svg('IA', '#7a1d42')), save=False)
        student.save()

        # A second student who has NOT paid yet
        student2 = make_user('student2', 'student12345', 'student', first_name='Hamza', last_name='Raza',
                             roll_number='EE-22045', email='student2@example.com', department='Electrical Engineering')
        if not student2.photo:
            student2.photo.save('demo-ee-22045.svg', ContentFile(avatar_svg('HR', '#4a2350')), save=True)

        drivers = [driver1, driver2]
        for i, (code, name, stops) in enumerate(ROUTES):
            route, _ = Route.objects.get_or_create(code=code, defaults={'name': name})
            for order, (stop_name, lat, lng) in enumerate(stops, start=1):
                Stop.objects.get_or_create(route=route, order=order,
                                           defaults={'name': stop_name, 'latitude': lat, 'longitude': lng})
            bus, _ = Bus.objects.get_or_create(
                bus_number=f'Point {i + 1}',
                defaults={'plate_number': f'JA-{1010 + i}', 'route': route, 'driver': drivers[i], 'capacity': 50},
            )
            Schedule.objects.get_or_create(route=route, trip_type='morning',
                                           defaults={'bus': bus, 'departure_time': time(7, 15 + i * 10)})
            Schedule.objects.get_or_create(route=route, trip_type='evening',
                                           defaults={'bus': bus, 'departure_time': time(16, 30)})

        # student1 already paid and was approved, so they have a fee receipt
        if not Payment.objects.filter(transaction_id='DEMO-8842117731').exists():
            p = Payment(student=student, route=Route.objects.get(code='R1'), semester=settings.POINT_SEMESTER_NAME,
                        amount=settings.POINT_FEE_AMOUNT, method='jazzcash', transaction_id='DEMO-8842117731',
                        status='approved', reviewed_at=timezone.now())
            p.receipt.save('demo-receipt.svg', ContentFile(receipt_svg('DEMO-8842117731', settings.POINT_FEE_AMOUNT)), save=True)

        self.stdout.write(self.style.SUCCESS(
            'Demo data ready.\n'
            '  Admin:   admin / admin12345   (http://127.0.0.1:8000/admin)\n'
            '  Driver:  driver1 / driver12345  (Point 1, route R1)\n'
            '  Student: student1 (or CS-21001) / student12345  (fee approved, has a receipt)\n'
            '  Student: student2 (or EE-22045) / student12345  (fee not paid yet)'
        ))
