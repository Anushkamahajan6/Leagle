import socketio
import logging

logger = logging.getLogger(__name__)

# Create a Socket.io server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# The ASGI application wrapper is now created in main.py to avoid circular imports

async def broadcast_alert(alert_data: dict):
    """
    Broadcast an alert to all connected clients.
    """
    try:
        await sio.emit('new_alert', alert_data)
        logger.info(f"📣 Broadcasted alert: {alert_data.get('message')}")
    except Exception as e:
        logger.error(f"Failed to broadcast alert: {e}")

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")
