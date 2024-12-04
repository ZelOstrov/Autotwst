import { request } from '@playwright/test';
import type {
    FullConfig,
    FullResult,
    Reporter,
    Suite,
    TestCase,
    TestResult,
} from '@playwright/test/reporter';

class MyReporter implements Reporter {
    private passedTests: any[] = [];
    private failedTests: any[] = [];

    onTestEnd(test: TestCase, result: TestResult) {
        const testResult = {
            "Название теста": test.title,
            "Статус": result.status === 'passed' ? '✅ Успешно' : '❌ Неуспешно',
            "Длительность теста": this.formatDuration(result.duration),
            "Ошибки": result.errors.map(error => ({
                "Ошибка": this.cleanErrorMessage(error.message),
            })),
        };

        if (result.status === 'passed') {
            this.passedTests.push(testResult);
        } else {
            this.failedTests.push(testResult);
        }
    }

    async onEnd(result: FullResult) {
        const endpoint = process.env.ENDPOINT_FOR_REPORT_TECHNODROM;
        const requestContext = await request.newContext();

        try {
            const response = await requestContext.post(endpoint, {
                data: {
                    "Общий результат для Technodrom": {
                        "Всего тестов": this.passedTests.length + this.failedTests.length,
                        "Успешно": this.passedTests.length,
                        "Неуспешно": this.failedTests.length,
                    },
                    "Успешные Тесты": this.passedTests,
                    "Неуспешные Тесты": this.failedTests.length > 0 ? this.failedTests : 'Все тесты успешно пройдены 🎉',
                },
            });

            if (response.ok()) {
                console.log('Отчет успешно отправлен');
            } else {
                console.error(`Ошибка при отправке отчета: ${response.status()}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке отчета:', error);
        }

        await requestContext.dispose();
    }

    private cleanErrorMessage(message: string) {
        return message.replace(/\u001b\[\d{1,2}m/g, '').trim(); // Убираем управляющие символы ANSI
    }

    private formatDuration(ms: number) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let durationString = '';

        if (hours > 0) {
            durationString += `${hours} ч `;
        }
        if (minutes > 0) {
            durationString += `${minutes} мин `;
        }

        durationString += `${seconds} сек`;

        return durationString.trim();
    }
}

export default MyReporter;
