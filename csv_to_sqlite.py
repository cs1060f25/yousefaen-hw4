#!/usr/bin/env python3

import argparse
import csv
import sqlite3
import os
import sys

def main():
    parser = argparse.ArgumentParser(description='Convert CSV file to SQLite database')
    parser.add_argument('database', help='SQLite database file name')
    parser.add_argument('csv_file', help='CSV file to import')

    args = parser.parse_args()

    if not os.path.exists(args.csv_file):
        print(f"Error: CSV file '{args.csv_file}' not found", file=sys.stderr)
        sys.exit(1)

    table_name = os.path.splitext(os.path.basename(args.csv_file))[0]

    try:
        with open(args.csv_file, 'r', newline='', encoding='utf-8') as csvfile:
            csv_reader = csv.reader(csvfile)
            headers = next(csv_reader)

            conn = sqlite3.connect(args.database)
            cursor = conn.cursor()

            columns_def = ', '.join([f'{header} TEXT' for header in headers])
            create_table_sql = f'CREATE TABLE IF NOT EXISTS {table_name} ({columns_def})'
            cursor.execute(create_table_sql)

            cursor.execute(f'DELETE FROM {table_name}')

            placeholders = ', '.join(['?' for _ in headers])
            insert_sql = f'INSERT INTO {table_name} VALUES ({placeholders})'

            rows_inserted = 0
            for row in csv_reader:
                if len(row) == len(headers):
                    cursor.execute(insert_sql, row)
                    rows_inserted += 1

            conn.commit()
            print(f"Successfully imported {rows_inserted} rows into table '{table_name}'")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    main()