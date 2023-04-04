import * as React from 'react';
import { RedocStandalone } from 'redoc';

import { useQuery } from 'react-query'

export const Redoc = () => {

    const { data: spec } = useQuery('swagger', async () => {
        const res = await fetch('https://api.zapper.xyz/api/json');
        const json = await res.json();
        return json;
    }, { suspense: true })

    return <RedocStandalone spec={spec} />;
}
