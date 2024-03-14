import requests
from bs4 import BeautifulSoup
import re
import json
import csv
from concurrent.futures import ThreadPoolExecutor, as_completed

video_urls = [
     'https://www.nicovideo.jp/watch/sm7764520',
     'https://www.nicovideo.jp/watch/sm7764680',
     'https://www.nicovideo.jp/watch/sm7764782',
     'https://www.nicovideo.jp/watch/sm7764858',
     'https://www.nicovideo.jp/watch/sm7833382',
     'https://www.nicovideo.jp/watch/sm7899829',
     'https://www.nicovideo.jp/watch/sm7967300',
     'https://www.nicovideo.jp/watch/sm8034349',
     'https://www.nicovideo.jp/watch/sm8101678',
     'https://www.nicovideo.jp/watch/sm8165835',
     'https://www.nicovideo.jp/watch/sm8232775',
     'https://www.nicovideo.jp/watch/sm8295624',
     'https://www.nicovideo.jp/watch/sm8370272',
     'https://www.nicovideo.jp/watch/sm8433635',
     'https://www.nicovideo.jp/watch/sm8494034',
     'https://www.nicovideo.jp/watch/sm8563638',
     'https://www.nicovideo.jp/watch/sm8628740',
     'https://www.nicovideo.jp/watch/sm8697039',
     'https://www.nicovideo.jp/watch/sm8764587',
     'https://www.nicovideo.jp/watch/sm8832621',
     'https://www.nicovideo.jp/watch/sm8896446',
     'https://www.nicovideo.jp/watch/sm8968508',
     'https://www.nicovideo.jp/watch/sm9036273',
     'https://www.nicovideo.jp/watch/sm9096340',
     'https://www.nicovideo.jp/watch/sm9158400',
     'https://www.nicovideo.jp/watch/sm9229341',
     'https://www.nicovideo.jp/watch/sm9297572'
] # Should function with any vocaranks that have LINKED songs in their descs.
pattern = re.compile(r'https://www.nicovideo.jp/watch/(sm\d+|nm\d+)')

def extract_links_from_description(description_data):
    return pattern.findall(description_data)

def get_video_title_and_availability(url):
    print(f"Fetching title from: {url}")
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    title_tag = soup.select_one('title')
    original_title = title_tag.text.strip() if title_tag else 'Title not found'

    if original_title == 'ニコニコ動画':
        nicolog_url = url.replace('nicovideo', 'nicolog')
        print(f"Attempting title fetch from Nicolog: {nicolog_url}")
        nicolog_response = requests.get(nicolog_url)
        nicolog_soup = BeautifulSoup(nicolog_response.text, 'html.parser')
        nicolog_title_tag = nicolog_soup.select_one('meta[property="og:title"]')
        if nicolog_title_tag:
            nicolog_title = nicolog_title_tag.get('content', '').replace('ニコログ｜', '').strip()
            if nicolog_title:
                title = nicolog_title
                available = "Unavailable"
            else:
                title = 'Title not found from Nicolog'
                available = "Unavailable"
        else:
            title = 'Nicolog fetch failed'
            available = "Unavailable"
    else:
        title = original_title.replace(' - ニコニコ動画', '').strip()
        available = "Available"

    print(f"Title: {title}, Available: {available}")
    return url.split('/')[-1], title, available

def process_url(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    json_data_div = soup.select_one('#js-initial-watch-data')
    main_video_id = url.split('/')[-1]

    if json_data_div:
        json_data_str = json_data_div.get('data-api-data')
        if json_data_str:
            json_data = json.loads(json_data_str)
            main_video_title = json_data.get('video', {}).get('title', '')
            description = json_data.get('video', {}).get('description', '')
            video_ids = extract_links_from_description(description)

            video_group_info = [('Video ID', 'Title', 'Availability')]
            video_group_info.append((main_video_id, main_video_title, 'Main Video'))

            with ThreadPoolExecutor() as executor:
                futures = [executor.submit(get_video_title_and_availability, f'https://www.nicovideo.jp/watch/{video_id}') for video_id in video_ids]
                for future in as_completed(futures):
                    video_id, video_title, available = future.result()
                    video_group_info.append((video_id, video_title, available))

            return video_group_info
        else:
            print('No JSON data found in the HTML.')
    else:
        print('No JSON data container found.')

with ThreadPoolExecutor() as executor:
    futures = [executor.submit(process_url, url) for url in video_urls]
    videos_info = [future.result() for future in as_completed(futures) if future.result()]

csv_filename = 'video_info.csv'
with open(csv_filename, 'w', newline='', encoding='utf-8-sig') as file:
    writer = csv.writer(file)
    for video_group in videos_info:
        writer.writerow([])
        writer.writerow([video_group[1][1], '', ''])
        writer.writerows(video_group)

print(f"CSV file has been created: {csv_filename}")