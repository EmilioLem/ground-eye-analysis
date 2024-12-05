import csv

def csv_to_js_array(csv_filepath, js_filepath):
    """Converts a CSV file to a JavaScript array of objects and saves it to a .js file.

    Args:
        csv_filepath: Path to the input CSV file.
        js_filepath: Path to the output .js file.
    """

    data = []
    with open(csv_filepath, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)  # Use DictReader for named fields
        for row in reader:
            # Convert string values to their correct data types
            js_obj = {
                'H': row['H'],
                'V': int(row['V']),
                'C': int(row['C']),
                'R': int(row['R']),
                'G': int(row['G']),
                'B': int(row['B'])
            }
            data.append(js_obj)

    with open(js_filepath, 'w', encoding='utf-8') as jsfile:
        jsfile.write('const colorData = ')  # Write the variable declaration
        jsfile.write(str(data))  # Write the data as a JSON string
        jsfile.write(';') #End with semicolon


# Example usage:
csv_filepath = 'colors.csv' #Replace with your actual csv filename/path
js_filepath = 'colorData.js' #Replace with your desired output js file name/path
csv_to_js_array(csv_filepath, js_filepath)
print(f"CSV data converted to JavaScript array and saved to {js_filepath}")
