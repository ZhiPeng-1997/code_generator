export const formatTimestamp = function(timestamp: number): string {
    const date = new Date(timestamp);

    // 获取年、月、日
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
    const day = String(date.getDate()).padStart(2, '0');

    // 获取小时、分钟、秒
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 拼接为 yyyy-MM-dd HH:mm:ss 格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}