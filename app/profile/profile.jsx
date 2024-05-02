import React from 'react';

import { UserProfile } from '@clerk/nextjs';

const Profile = () => {
    return (
        <div className={'flex h-full w-full items-center justify-center bg-secondary_light'}>
            <UserProfile path="/profile" routing="path" />
        </div>
    );
};

export default Profile;
