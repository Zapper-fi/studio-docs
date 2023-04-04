import * as React from 'react';
import Layout from '@theme/Layout';

import { QueryProvider } from '@site/src/components/QueryProvider';
import { Redoc } from '@site/src/components/Redoc';

const DocumentationPage = () => {
    return (
        <Layout>
            <QueryProvider>
                <React.Suspense fallback={'Loading'}>
                    <Redoc />
                </React.Suspense>
            </QueryProvider>
        </Layout>
    )
}

export default DocumentationPage;