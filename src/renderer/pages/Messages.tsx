import { Card, CardBody } from '../components';

export const Messages = () => {
  return (
    <Card>
      <CardBody>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', marginBottom: '1rem' }}>
            Messages
          </h2>
          <p style={{ fontSize: '1rem', color: '#65676B' }}>
            Messaging feature coming soon. Connect with matches to start conversations.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};
