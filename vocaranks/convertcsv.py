import csv
import json

def process_csv(file_path):
    data = []
    current_vocarank = None

    with open(file_path, 'r', encoding='utf-8-sig') as file:
        reader = csv.reader(file)
        for row in reader:
            if len(row) == 3 and row[1] == '' and row[2] == '':
                current_vocarank = row[0]
            elif len(row) >= 3:
                video_id, title, availability = row[:3]
                if video_id and title:
                    data.append({
                        'id': video_id,
                        'title': title,
                        'availability': availability,
                        'vocarank': current_vocarank
                    })

    return data

# Usage
csv_file = 'video_info.csv'
output_file = 'output.js'

processed_data = process_csv(csv_file)

with open(output_file, 'w', encoding='utf-8') as file:
    json.dump(processed_data, file, ensure_ascii=False, indent=2)