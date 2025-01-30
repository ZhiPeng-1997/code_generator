'use client'
// import ReactJsonView from '@microlink/react-json-view'
import { useEffect, useState } from 'react';
import dynamic from "next/dynamic"

export default function CdkDetail({ params }: { params: { cdk_value: string } }) {

    const [jsonData, setJsonData] = useState(null);
    const ReactJsonView = dynamic(() => import('@microlink/react-json-view'))

    useEffect(() => {
        fetch(`/api/cdk/${params.cdk_value}`)
            .then(res => res.json())
            .then(setJsonData)
    }, [])


    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                {!!jsonData ? (<ReactJsonView src={jsonData} />): (<p>Loading...</p>)}
            </main>
        </div>
    );
}