import csv

def process_txt_to_csv(input_file, output_file):
    with open(input_file, 'r') as file:
        lines = file.readlines()

    data = []
    current_hue = None

    for line in lines:
        line = line.strip()
        if line.startswith('#'):  # Look for hue lines
            current_hue = line[2:]  # Remove the '# ' prefix
        else:
            # Process the data in the line
            entries = line.split()
            for i in range(0, len(entries), 3):  # Process each set of V, C, and RGB
                v = entries[i]
                c = entries[i + 1]
                rgb = entries[i + 2].strip('[]').split(',')  # Extract RGB values
                r, g, b = rgb
                data.append([current_hue, v, c, r, g, b])

    # Write the processed data to a CSV file
    with open(output_file, 'w', newline='') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(['H', 'V', 'C', 'R', 'G', 'B'])  # Header
        csvwriter.writerows(data)

# Example usage:
input_file = 'colors.txt'  # Replace with your input file name
output_file = 'colors.csv'  # Replace with your desired output file name
process_txt_to_csv(input_file, output_file)
