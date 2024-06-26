import React from 'react';

import { UserProfile } from '@clerk/nextjs';

const Profile = () => {
    return (
        <div className=" h-full w-full overflow-y-scroll bg-secondary_light p-1">
            <UserProfile path="/profile" routing="path" />
        </div>
    );
};

export default Profile;
