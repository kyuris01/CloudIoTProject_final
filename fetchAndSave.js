process.env.TZ = 'Asia/Seoul';
const axios = require('axios');
const { MongoClient } = require('mongodb');
const URI = process.env.CONNECTION_STRING;
const client = new MongoClient(URI);
const accessToken = process.env.ACCESS_TOKEN;
const userId = process.env.USER_ID;
function getFormattedYesterday() {
    const today = new Date();
    // 어제의 날짜를 가져오기 위해 현재 날짜에서 1을 빼줍니다.
    today.setDate(today.getDate() - 1);
    
    const year = today.getFullYear();
    let month = today.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
    let day = today.getDate();

    // 달과 일이 한 자리 숫자일 경우, 앞에 0을 추가합니다.
    if (month < 10) {
        month = '0' + month;
    }
    if (day < 10) {
        day = '0' + day;
    }

    return `${year}-${month}-${day}`;
}

const date = getFormattedYesterday();

exports.handler = async () => {
    const fetchActivitySummary = async (accessToken, userId, date) => {
        try {
            const response = await axios.get("https://api.fitbit.com/1/user/" + userId + "/activities/date/" + date + ".json", {
                headers: {
                    "Authorization": "Bearer " + accessToken
                }
            });
            response.data.userId = userId;
            response.data.date = date;
            const user_data = response.data;
            await client.connect();
            await client.db("admin").command({ ping: 1 });
            await createListing(client, user_data);
            
            return user_data;
        } catch (error) {
            console.error(error);
            return null;  // 에러 발생 시 null 반환
        }
        finally {
            await client.close();
        }
    };
    
    
    async function createListing(client, user_data){
        await client.db("").collection("user_info").insertOne(user_data);
    }
    
    const result = await fetchActivitySummary(accessToken, userId, date);
    
    return result;  // Lambda 함수의 반환 값
};