import pandas as pd
import json
import glob
import os

# === STEP 1: Load Spreadsheets ===

base_dir = os.path.join(os.getcwd(), "dataSort")

pre_file = os.path.join(base_dir, "pre_test.xlsx")
post_file = os.path.join(base_dir, "post_test.xlsx")
survey_file = os.path.join(base_dir, "survey.xlsx")

# Load Excel files
pre_df = pd.read_excel(pre_file)
post_df = pd.read_excel(post_file)
survey_df = pd.read_excel(survey_file)

# Standardize and normalize participant column
for df in [pre_df, post_df, survey_df]:
    df.rename(columns=lambda col: col.lower().strip(), inplace=True)
    id_col = [c for c in df.columns if 'participant' in c or 'user' in c][0]
    df.rename(columns={id_col: 'participant'}, inplace=True)
    df['participant'] = df['participant'].astype(str).str.strip().str.lower()

# Drop unwanted metadata columns
columns_to_drop = ['email', 'name', 'last modified time', 'start time', 'completion time', 'id']
for df in [pre_df, post_df, survey_df]:
    df.drop(columns=[col for col in columns_to_drop if col in df.columns], inplace=True)

# Merge all 3 spreadsheets on participant
merged_feedback = pre_df.merge(post_df, on='participant', how='outer', suffixes=('_pre', '_post'))
merged_feedback = merged_feedback.merge(survey_df, on='participant', how='outer')

# === STEP 2: Load JSON Game Session Data ===

game_dir = os.path.join(base_dir, "game_sessions/")
json_files = glob.glob(os.path.join(game_dir, "*.json"))

game_data = []

for filepath in json_files:
    with open(filepath, 'r') as f:
        try:
            data = json.load(f)
            participant = data.get("participant", os.path.basename(filepath).split("_")[2])
            participant = str(participant).strip().lower()

            q_data = data.get("questionData", [])
            correct = sum(1 for q in q_data if q.get("wasCorrect"))
            total = len(q_data)
            incorrect = total - correct
            avg_time = sum(q.get("timeSpentMs", 0) for q in q_data) / total if total else 0

            game_data.append({
                "participant": participant,
                "game_mode": data.get("gameMode", "standard"),
                "total_tiles_bought": data.get("totalTilesBought"),
                "healthy_tiles_remaining": data.get("healthyTilesRemaining"),
                "final_food": data.get("finalResources", {}).get("food"),
                "final_wood": data.get("finalResources", {}).get("wood"),
                "final_metal": data.get("finalResources", {}).get("metal"),
                "final_tech": data.get("finalResources", {}).get("tech"),
                "quiz_total_questions": total,
                "quiz_correct_total": correct,
                "quiz_incorrect_total": incorrect,
                "quiz_accuracy_pct": round((correct / total) * 100, 2) if total else 0,
                "avg_question_time_ms": round(avg_time, 2)
            })
        except Exception as e:
            print(f"❌ Failed to load {filepath}: {e}")

game_df = pd.DataFrame(game_data)

# === STEP 3: Merge Game Data with Feedback ===

final_merged = pd.merge(merged_feedback, game_df, on="participant", how="outer")

# Drop any rows without participant data
final_merged = final_merged[final_merged['participant'].str.startswith('user', na=False)]

# === STEP 4: Sort by Numeric User ID ===

# Create sortable helper column
final_merged['participant_padded'] = (
    final_merged['participant']
    .str.extract(r'(\d+)')[0]
    .astype(int)
    .apply(lambda x: f"user{x:02d}")
)

# Sort by padded version
final_merged = final_merged.sort_values(by='participant_padded')

# Drop helper column
final_merged.drop(columns=['participant_padded'], inplace=True)

# === STEP 5: Export ===

output_path = os.path.join(base_dir, "merged_edutopa_data.xlsx")
final_merged.to_excel(output_path, index=False)

print(f"✅ Merged data saved to: {output_path}")
