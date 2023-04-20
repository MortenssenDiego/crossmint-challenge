import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const candidateId = process.env.CANDIDATE_ID;
const maxMatrixSize = 11;
const matrixMiddle = Math.floor(maxMatrixSize / 2);

if(maxMatrixSize % 2 === 0) {
    throw new Error('Matrix size must be odd');
}

const apiClient = axios.create(
    { 
        baseURL: 'https://challenge.crossmint.io/api/',
    }
);

async function sleep(milliseconds: number) {
    await new Promise<void>(
        (resolve) => {
            setTimeout(() => resolve(), milliseconds);
        }
    );
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if(!axios.isAxiosError(error)) return Promise.reject(error);
        if(error.response?.status !== 429) return Promise.reject(error);
        await sleep(+(error.response.headers['retry-after'] || 10000));
        return apiClient.request(error.config!);
    }
)

async function setPolyanet(row: number, column: number) {
    try {
        await apiClient.post('/polyanets', {
            row, 
            column,
            candidateId,
        });
    } catch (error) {
        throw new Error(`Polyanet endpoint failed (${error})`);
    }
}

async function main() {
    try {
        for (let index = 2; index < maxMatrixSize - 2; index++) {
            await setPolyanet(index, index);
            if(index === matrixMiddle) continue;
            await setPolyanet(maxMatrixSize - index - 1, index);
        }
        console.log('Finished execution successfully')
    } catch (error) {
        console.error(`Finished execution with error: ${error}`)
    }
}

main();