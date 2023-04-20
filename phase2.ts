import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const candidateId = process.env.CANDIDATE_ID;
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

type ElementType = (
    'SPACE' |
    'POLYANET' |
    'BLUE_SOLOON' |
    'RED_SOLOON' |
    'PURPLE_SOLOON' |
    'WHITE_SOLOON' |
    'UP_COMETH' |
    'DOWN_COMETH' |
    'RIGHT_COMETH' |
    'LEFT_COMETH'
);
interface IGoalResponse {
    goal: ElementType[][];
}
async function getGoal() {
    try {
        const response = await apiClient.get<IGoalResponse>(`/map/${candidateId}/goal`);
        return response.data.goal;
    } catch(error) {
        throw new Error(`Goal endpoint failed (${error})`);
    }
}

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

async function setSoloon(row: number, column: number, color: 'blue' | 'red' | 'purple' | 'white') {
    try {
        await apiClient.post('/soloons', {
            row, 
            column,
            color,
            candidateId,
        });
    } catch (error) {
        throw new Error(`Soloon endpoint failed (${error})`);
    }
}

async function setCometh(row: number, column: number, direction: 'up' | 'down' | 'right' | 'left') {
    try {
        await apiClient.post('/comeths', {
            row, 
            column,
            direction,
            candidateId,
        });
    } catch (error) {
        throw new Error(`Cometh endpoint failed (${error})`);
    }
}

async function main() {
    try {
        const goal = await getGoal();
        
        const rowSize = goal.length;
        const columnSize = goal[0].length;

        for (let row = 0; row < rowSize; row++) {
            for (let column = 0; column < columnSize; column++) {
                switch (goal[row][column]) {
                case 'SPACE': break;
                case 'POLYANET': await setPolyanet(row, column); break;
                case 'BLUE_SOLOON': await setSoloon(row, column, 'blue'); break;
                case 'RED_SOLOON': await setSoloon(row, column, 'red'); break;
                case 'PURPLE_SOLOON': await setSoloon(row, column, 'purple'); break;
                case 'WHITE_SOLOON': await setSoloon(row, column, 'white'); break;
                case 'UP_COMETH': await setCometh(row, column, 'up'); break;
                case 'DOWN_COMETH': await setCometh(row, column, 'down'); break;
                case 'RIGHT_COMETH': await setCometh(row, column, 'right'); break;
                case 'LEFT_COMETH': await setCometh(row, column, 'left'); break;
                }
            }
        }
        
        console.log('Finished execution successfully')
    } catch (error) {
        console.error(`Finished execution with error: ${error}`)
    }
}

main();