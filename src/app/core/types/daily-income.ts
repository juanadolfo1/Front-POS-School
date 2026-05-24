export interface DailyIncomeByLevel {
    academic_level_id: number;
    academic_level_name: string;
    total_income: number;
    total_students_paid: number;
    promotion_eligible_count: number;
}

export interface DailyIncomeSummary {
    start_date: string;
    end_date: string;
    total_income: number;
    total_transactions: number;
    promotion_eligible_total: number;
    by_level: DailyIncomeByLevel[];
}
