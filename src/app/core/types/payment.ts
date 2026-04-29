export class Payment{
    public id: number;
    public label: string;
    public amount: number;
    public discount_amount: number;
    public last_day_with_discount: string;
    public is_up_to_date: boolean;
    public pay_concept_type: string;
}

export class PaymentToSave{
    public is_full_payment: boolean;
    public has_discount: boolean;
    public discount_type: string;
    public discount: number;
    public received_payment: number;
    public pay_concept_id: number;
    public student_group_id: number;
}
