import * as React from 'react';
import Layout from '@theme/Layout';
import { RedocStandalone } from 'redoc';

const DocumentationPage = () => {
    return (
        <Layout>
            <RedocStandalone specUrl="https://api.zapper.xyz/api-json" />
        </Layout>
    )
}

export default DocumentationPage;