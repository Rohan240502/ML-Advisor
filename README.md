# 📊 ML Advisor

> **Understand your dataset. Choose smarter ML models.**

ML Advisor is a privacy-first, client-side machine learning advisory tool that analyzes CSV datasets directly in the browser and provides structured recommendations for preparing data and selecting suitable machine learning models.

Upload a CSV file and ML Advisor automatically explores the dataset, detects potential target columns, identifies the machine learning problem type, evaluates data quality, recommends preprocessing steps, and ranks suitable ML algorithms.

The application is designed to help data analysts, students, and machine learning practitioners quickly understand a new dataset before building a model.

---

## ✨ Features

### 📁 CSV Dataset Analysis

Upload any standard CSV dataset and instantly generate a detailed analysis report.

ML Advisor examines:

* Number of rows and columns
* Numerical features
* Categorical features
* Boolean features
* Identifier columns
* Missing values
* Unique-value ratios
* Example values
* Potential target columns

---

### 🔒 100% Client-Side Processing

Your dataset stays inside your browser.

* No dataset is uploaded to a server
* No backend processing is required
* Analysis is performed locally
* Fast and privacy-friendly workflow

This makes ML Advisor suitable for exploring datasets that should not be transmitted to external services.

---

## 🧠 Automatic Target Detection

ML Advisor analyzes the dataset structure and attempts to identify the most likely machine learning target variable.

The detected target is displayed together with:

* Target column
* Prediction type
* Detection confidence

Example:

```text
Target: churn
Problem Type: Binary Classification
Confidence: 95%
```

---

## 🎯 ML Problem Type Detection

Based on the detected target and dataset characteristics, ML Advisor determines the likely machine learning task.

Supported analysis can include:

* Binary Classification
* Multiclass Classification
* Regression

This allows the application to provide recommendations that are appropriate for the dataset.

---

## 🧬 Dataset Profile & Schema

ML Advisor generates a structured overview of every feature in the dataset.

For each column, the report can display:

* Column name
* Data type
* Unique-value ratio
* Missing-value percentage
* Sample values
* Feature classification

Feature types are automatically grouped into categories such as:

```text
Numerical
Categorical
Boolean
Identifier
```

This gives users a quick understanding of the dataset without manually inspecting every column.

---

## 🩺 Dataset Health Score

The application calculates an overall dataset health score based on several characteristics.

The report evaluates areas such as:

* Completeness
* Schema consistency
* Feature quality
* Dataset size
* Missing-value behavior

This provides a quick indication of how ready the dataset is for machine learning.

---

## 🔍 Smart Dataset Insights

ML Advisor automatically highlights potential issues that could affect model performance.

Examples include:

### Class Imbalance

Detects when the target distribution is significantly uneven.

### Missing Values

Identifies columns containing missing data and suggests appropriate handling strategies.

### Feature Scaling

Detects features with substantially different numerical ranges.

### Identifier Columns

Recognizes high-cardinality columns that may represent IDs rather than meaningful predictive features.

### Potential Data Leakage

Warns about columns that may accidentally expose information related to the prediction target.

These insights help users identify common machine learning problems before model training begins.

---

## 📊 Interactive Data Science Visualizations

ML Advisor provides visual summaries of important dataset characteristics.

Visualizations may include:

* Feature-type distribution
* Missing-value distribution
* Target-class balance
* Dataset composition
* Data-quality indicators

These visualizations make it easier to understand dataset structure at a glance.

---

## 🧹 Intelligent Preprocessing Plan

Based on the detected dataset characteristics, ML Advisor generates a recommended preprocessing strategy.

Recommendations may include:

### Numerical Features

* Median imputation for missing values
* StandardScaler
* MinMaxScaler
* Outlier handling

### Categorical Features

* Mode imputation
* One-hot encoding
* Encoding strategies for categorical variables

### Identifier Columns

* Removing ID-like features that provide little predictive value

### Validation Strategy

* Stratified train/test splitting for classification
* Class-distribution preservation
* Appropriate train/test ratios

Each recommendation explains why the preprocessing step may be useful.

---

## 🔄 Recommended ML Pipeline

ML Advisor converts its analysis into an easy-to-follow machine learning workflow.

Example pipeline:

```text
Raw Dataset
      ↓
Missing Value Handling
      ↓
Categorical Encoding
      ↓
Feature Scaling
      ↓
Model Training
      ↓
Model Evaluation
```

The pipeline allows users to understand how the dataset should move from raw CSV data to a model-ready form.

---

## 🤖 ML Model Recommendations

One of the core features of ML Advisor is automatic model ranking.

Based on the dataset and detected prediction problem, the application recommends suitable machine learning algorithms.

Possible recommendations include:

* Gradient Boosting Classifier
* Random Forest Classifier
* Logistic Regression
* Support Vector Machine (SVC)
* Other problem-appropriate models

Each model recommendation includes useful characteristics such as:

* Compatibility score
* Expected performance
* Training speed
* Interpretability
* Dataset match
* Key strengths
* Potential limitations

---

## 🏆 Model Ranking

Models are ranked according to their suitability for the analyzed dataset.

Example:

| Rank  | Model                        | Compatibility |
| ----- | ---------------------------- | ------------- |
| 🥇 #1 | Gradient Boosting Classifier | High          |
| 🥈 #2 | Random Forest Classifier     | High          |
| 🥉 #3 | Logistic Regression          | Good          |

The ranking helps users quickly identify promising algorithms without manually testing every possible model first.

---

## ⚖️ Model Architecture Comparison

ML Advisor provides a side-by-side comparison of recommended algorithms.

Models can be compared across dimensions such as:

| Criteria                | Model 1     | Model 2             | Model 3             |
| ----------------------- | ----------- | ------------------- | ------------------- |
| Compatibility           | High        | High                | Good                |
| Expected Performance    | High        | High                | Moderate            |
| Training Speed          | Fast        | Moderate            | Instant/Fast        |
| Interpretability        | Medium      | High                | Very High           |
| Missing Value Tolerance | Varies      | Requires Imputation | Requires Imputation |
| Scaling Requirement     | Usually Low | Low                 | Usually Required    |
| Imbalance Handling      | Supported   | Supported           | Weighted Options    |

This makes it easier to understand the trade-offs between different machine learning approaches.

---

## 📈 Evaluation & Validation Strategy

ML Advisor also recommends appropriate evaluation metrics based on the detected ML problem.

For classification tasks, recommendations may include:

### Primary Metric

```text
F1 Score
```

### Secondary Metrics

```text
Precision
Recall
ROC-AUC
```

The application can also recommend validation strategies such as:

```text
Stratified Train/Test Split
```

This is particularly useful when working with imbalanced classification datasets.

---

## 🚀 How It Works

The complete workflow is simple:

```text
1. Upload CSV Dataset
        ↓
2. Dataset Profiling
        ↓
3. Schema Detection
        ↓
4. Data Quality Analysis
        ↓
5. Target Detection
        ↓
6. ML Problem Classification
        ↓
7. Preprocessing Recommendations
        ↓
8. Model Ranking
        ↓
9. Model Comparison
        ↓
10. Evaluation Strategy
```

No complicated configuration is required.

---

## 🖥️ Application Workflow

### 1. Upload your dataset

Drag and drop a CSV file or select one from your computer.

### 2. Automatic analysis

ML Advisor analyzes the dataset directly inside the browser.

### 3. Explore the report

Navigate through analysis sections such as:

```text
Overview & Schema
Health & Insights
Target & Problem
Data Quality
Feature Charts
Preprocessing
ML Pipeline Flow
Model Rankings
Comparison
```

### 4. Review recommendations

Use the generated insights to prepare your dataset and choose suitable machine learning algorithms.

---

## 🛠️ Tech Stack

ML Advisor is built as a modern client-side web application.

### Frontend

* TypeScript
* Vite
* HTML5
* CSS
* Modern browser APIs

### Data Processing

* Client-side CSV parsing
* Browser-based dataset profiling
* Local statistical analysis
* ML recommendation logic
* Browser/Web Worker based processing

### Development

* Node.js
* npm
* Git
* GitHub

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/Rohan240502/ML-Advisor.git
```

Move into the project directory:

```bash
cd ML-Advisor
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will start the local development server.

Open the displayed local URL in your browser, typically:

```text
http://localhost:5173
```

---

## 🏗️ Build for Production

Create an optimized production build with:

```bash
npm run build
```

The generated production files will be placed in:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

---

## 📂 Project Structure

A simplified project structure:

```text
ML-Advisor/
│
├── public/
│   └── Static assets
│
├── src/
│   ├── Application source code
│   ├── Components
│   ├── Data analysis logic
│   ├── ML recommendation logic
│   └── Styles
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

---

## 🔐 Privacy

Privacy is one of the main design principles of ML Advisor.

The application is designed so that dataset analysis occurs directly in the user's browser.

```text
Your CSV
   ↓
Browser
   ↓
Local Analysis
   ↓
ML Recommendations
```

There is no requirement to send the dataset to an external machine learning API or remote analysis server.

This provides:

* Better privacy
* Faster interaction
* No dataset upload latency
* Reduced infrastructure requirements

---

## 🎯 Use Cases

ML Advisor can be useful for:

* Data analysts exploring unfamiliar datasets
* Machine learning beginners
* Data science students
* Hackathon projects
* Rapid exploratory data analysis
* ML model selection
* Dataset quality assessment
* Preprocessing planning
* Classification project preparation
* Regression project preparation

---

## 💡 Why ML Advisor?

Choosing an ML algorithm is rarely the first step of a successful machine learning project.

Before training a model, you need to understand:

```text
Is my data clean?

Which column should I predict?

Is this classification or regression?

Are my classes imbalanced?

Which columns need encoding?

Which features need scaling?

How should I handle missing values?

Which models are appropriate?

Which evaluation metric should I use?
```

ML Advisor brings those decisions together into a single interactive analysis workflow.

---

## 🗺️ Future Improvements

Possible future improvements include:

* Automatic exploratory data analysis
* Additional visualizations
* Correlation analysis
* Feature importance estimation
* Outlier visualization
* More advanced target detection
* Hyperparameter recommendations
* Regression-specific model ranking
* Multiclass-specific recommendations
* Time-series detection
* Automatic ML pipeline code generation
* Downloadable analysis reports
* Dataset comparison
* Model explainability recommendations

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

```bash
git clone https://github.com/Rohan240502/ML-Advisor.git
```

Create a new branch:

```bash
git checkout -b feature/your-feature
```

Commit your changes:

```bash
git commit -m "Add new feature"
```

Push the branch:

```bash
git push origin feature/your-feature
```

Then open a Pull Request on GitHub.

---

## ⭐ Support

If you find ML Advisor useful, consider giving the repository a **⭐ star** on GitHub.

Repository:

**https://github.com/Rohan240502/ML-Advisor**

---

## 👨‍💻 Author

**Rohan**

GitHub: [@Rohan240502](https://github.com/Rohan240502)

---

<div align="center">

### 📊 ML Advisor

**Understand your dataset. Choose smarter ML models.**

Built to make the first steps of machine learning faster, clearer, and more informed.

</div>
