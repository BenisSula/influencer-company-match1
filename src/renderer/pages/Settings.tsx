import { Card, CardHeader, CardBody } from '../components';

export const Settings = () => {
  return (
    <>
      <Card style={{ marginBottom: '1rem' }}>
        <CardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', margin: 0 }}>
            Settings
          </h2>
        </CardHeader>
        <CardBody>
          <p style={{ fontSize: '0.9375rem', color: '#65676B' }}>
            Manage your account settings and preferences
          </p>
        </CardBody>
      </Card>

      <Card style={{ marginBottom: '1rem' }}>
        <CardHeader>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', margin: 0 }}>
            Account Settings
          </h3>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#F0F2F5', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#050505', marginBottom: '0.25rem' }}>
                Email Notifications
              </div>
              <div style={{ fontSize: '0.875rem', color: '#65676B' }}>
                Receive email updates about new matches and messages
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#F0F2F5', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#050505', marginBottom: '0.25rem' }}>
                Privacy Settings
              </div>
              <div style={{ fontSize: '0.875rem', color: '#65676B' }}>
                Control who can see your profile and contact you
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#F0F2F5', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#050505', marginBottom: '0.25rem' }}>
                Matching Preferences
              </div>
              <div style={{ fontSize: '0.875rem', color: '#65676B' }}>
                Customize your matching criteria and filters
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
};
