import { Injectable, NgZone } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '../../environment';
import { Observable, Subject } from 'rxjs';

export interface RealtimeSensorEvent {
    sensor_key: string;
    feed_key: string;
    value: string;
    received_at: string;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
    private echo?: Echo<any>;
    private sensorSubject = new Subject<RealtimeSensorEvent>();

    constructor(private zone: NgZone) { }

    init(): void {
        if (this.echo) return;
        const pKey = (environment as any).pusherKey;
        if (!pKey) {
            console.warn('[RealtimeService] pusherKey no configurado en environment');
            return;
        }
        const pCluster = (environment as any).pusherCluster || 'mt1';

        // Exponer Pusher para Echo (algunos builds lo requieren)
        (window as any).Pusher = Pusher;

    this.echo = new Echo<any>({
            broadcaster: 'pusher',
            key: pKey,
            cluster: pCluster,
            forceTLS: true,
            enabledTransports: ['ws', 'wss']
        });

        this.echo.channel('sensors')
            .listen('.sensor.data', (e: RealtimeSensorEvent) => {
                console.debug('[RealtimeService] Evento recibido desde Pusher:', e);
                this.zone.run(() => this.sensorSubject.next(e));
            });
    }

    onSensorData(): Observable<RealtimeSensorEvent> {
        return this.sensorSubject.asObservable();
    }
}
