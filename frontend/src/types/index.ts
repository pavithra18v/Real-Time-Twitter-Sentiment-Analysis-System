export interface TrainingRequest {
    model_type: "LSTM" | "BERT" | "SVM" | "RF" | "LR";
    explainability_method: "LIME" | "SHAP";
    split_ratio: number;
    dataset_filenames: string[];
}

export interface Metrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    confusion_matrix: number[][];
}

export interface AnalysisResult {
    text: string;
    sentiment: string;
    confidence: number;
    explanation?: any;
    user_id?: string;
    username?: string;
    country?: string;
}

export interface LiveTwitterRequest {
    keyword: string;
    count: number;
    model_type: string;
    explainability_method: string;
}

export interface Dataset {
    id: number;
    name: string;
    rows: number;
    date: string;
}
