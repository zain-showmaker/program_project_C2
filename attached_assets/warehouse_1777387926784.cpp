#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <iomanip>
#include <limits>
#include <algorithm>
#include <cctype>
#include <ctime>

using namespace std;

struct Component {
    int id;
    string category;
    string model;
    int quantity;
    double price;
};

class InputValidator {
public:
    static void clearBuffer() {
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    static int readInt(const string& prompt, int minVal, int maxVal) {
        int value;
        while (true) {
            cout << prompt;
            if (cin >> value && value >= minVal && value <= maxVal) {
                clearBuffer();
                return value;
            }
            clearBuffer();
            cout << "  [!] Invalid input. Please enter an integer between "
                 << minVal << " and " << maxVal << ".\n";
        }
    }

    static double readDouble(const string& prompt, double minVal, double maxVal) {
        double value;
        while (true) {
            cout << prompt;
            if (cin >> value && value >= minVal && value <= maxVal) {
                clearBuffer();
                return value;
            }
            clearBuffer();
            cout << "  [!] Invalid input. Please enter a number between "
                 << fixed << setprecision(2) << minVal << " and " << maxVal << ".\n";
        }
    }

    static string readNonEmptyString(const string& prompt) {
        string value;
        while (true) {
            cout << prompt;
            getline(cin, value);
            value.erase(0, value.find_first_not_of(" \t\r\n"));
            value.erase(value.find_last_not_of(" \t\r\n") + 1);
            if (!value.empty() && value.find('|') == string::npos) return value;
            cout << "  [!] Value cannot be empty or contain the '|' character.\n";
        }
    }

    static char readYesNo(const string& prompt) {
        string value;
        while (true) {
            cout << prompt;
            getline(cin, value);
            if (!value.empty()) {
                char c = static_cast<char>(tolower(value[0]));
                if (c == 'y' || c == 'n') return c;
            }
            cout << "  [!] Please answer with 'y' or 'n'.\n";
        }
    }
};

class WarehouseSystem {
private:
    vector<Component> inventory;
    const string fileName = "inventory.csv";
    const string salesLogFile = "sales_history.csv";

    string currentTimestamp() const {
        time_t now = time(nullptr);
        tm* lt = localtime(&now);
        char buf[20];
        strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", lt);
        return string(buf);
    }

    void logSale(const Component& item, int qty, double total) const {
        bool needHeader = false;
        {
            ifstream check(salesLogFile);
            needHeader = !check.good();
        }
        ofstream log(salesLogFile, ios::app);
        if (!log.is_open()) {
            cout << "  [!] Warning: could not open '" << salesLogFile << "' for writing.\n";
            return;
        }
        if (needHeader) {
            log << "timestamp|id|category|model|quantity|unit_price|total\n";
        }
        log << currentTimestamp() << "|" << item.id << "|" << item.category << "|"
            << item.model << "|" << qty << "|"
            << fixed << setprecision(2) << item.price << "|"
            << fixed << setprecision(2) << total << "\n";
    }

    int nextId() const {
        int maxId = 0;
        for (const auto& it : inventory) {
            if (it.id > maxId) maxId = it.id;
        }
        return maxId + 1;
    }

    string upper(string s) const {
        for (auto& c : s) c = static_cast<char>(toupper(c));
        return s;
    }

    void printSeparator(char ch, int width) const {
        cout << setfill(ch) << setw(width) << "" << setfill(' ') << "\n";
    }

    void printHeader(const string& title) const {
        const int width = 78;
        cout << "\n";
        printSeparator('=', width);
        int pad = (width - static_cast<int>(title.size())) / 2;
        cout << string(pad, ' ') << title << "\n";
        printSeparator('=', width);
    }

public:
    WarehouseSystem() {
        loadFromFile();
        if (inventory.empty()) {
            initializeDefaultInventory();
            saveToFile();
        }
    }

    void initializeDefaultInventory() {
        inventory = {
            // CPUs
            {1,  "CPU",  "Intel Core i3-13100",      15, 130.00},
            {2,  "CPU",  "Intel Core i5-13400",      10, 230.00},
            {3,  "CPU",  "Intel Core i7-13700K",      8, 410.00},
            {4,  "CPU",  "Intel Core i9-14900K",      5, 580.00},
            {5,  "CPU",  "AMD Ryzen 5 7600X",        12, 250.00},
            {6,  "CPU",  "AMD Ryzen 7 7800X3D",       8, 450.00},
            {7,  "CPU",  "AMD Ryzen 9 7950X",         6, 620.00},
            {8,  "CPU",  "AMD Ryzen 9 9950X",         4, 700.00},

            // GPUs
            {9,  "GPU",  "NVIDIA RTX 4060",          12, 300.00},
            {10, "GPU",  "NVIDIA RTX 4070 Super",     9, 620.00},
            {11, "GPU",  "NVIDIA RTX 4080 Super",     5, 1100.00},
            {12, "GPU",  "NVIDIA RTX 4090",           3, 1600.00},
            {13, "GPU",  "AMD RX 7700 XT",            8, 450.00},
            {14, "GPU",  "AMD RX 7800 XT",            7, 500.00},
            {15, "GPU",  "AMD RX 7900 XTX",           4, 950.00},
            {16, "GPU",  "Intel Arc A770",            6, 320.00},

            // RAM
            {17, "RAM",  "Corsair 16GB DDR4 3200",   20,  45.00},
            {18, "RAM",  "G.Skill 32GB DDR4 3600",   18,  85.00},
            {19, "RAM",  "Kingston 32GB DDR5 6000",  15, 120.00},
            {20, "RAM",  "Corsair 64GB DDR5 6400",    5, 210.00},
            {21, "RAM",  "Crucial 16GB DDR5 5600",   22,  65.00},

            // SSD
            {22, "SSD",  "Samsung 970 EVO 1TB NVMe", 25,  80.00},
            {23, "SSD",  "WD Black SN850X 2TB",      10, 160.00},
            {24, "SSD",  "Crucial T700 4TB Gen5",     4, 400.00},
            {25, "SSD",  "Kingston KC3000 1TB",      18, 100.00},
            {26, "SSD",  "Samsung 990 Pro 2TB",       9, 220.00},

            // Motherboards
            {27, "MOBO", "ASUS Prime B760-Plus",     10, 140.00},
            {28, "MOBO", "MSI MAG B650 Tomahawk",     9, 230.00},
            {29, "MOBO", "ASUS ROG Z790 Hero",        6, 600.00},
            {30, "MOBO", "Gigabyte X670E Aorus",      5, 450.00},
            {31, "MOBO", "ASRock B650M Pro RS",      11, 160.00},
            {32, "MOBO", "MSI MEG Z790 Ace",          3, 720.00}
        };
    }

    void saveToFile() const {
        ofstream file(fileName);
        if (!file.is_open()) {
            cout << "  [!] Warning: could not open '" << fileName << "' for writing.\n";
            return;
        }
        for (const auto& item : inventory) {
            file << item.id << "|" << item.category << "|" << item.model << "|"
                 << item.quantity << "|" << fixed << setprecision(2) << item.price << "\n";
        }
    }

    void loadFromFile() {
        ifstream file(fileName);
        if (!file.is_open()) return;

        inventory.clear();
        string line;
        while (getline(file, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string idStr, category, model, qtyStr, priceStr;
            if (!getline(ss, idStr, '|')) continue;
            if (!getline(ss, category, '|')) continue;
            if (!getline(ss, model, '|')) continue;
            if (!getline(ss, qtyStr, '|')) continue;
            if (!getline(ss, priceStr)) continue;

            try {
                Component item;
                item.id = stoi(idStr);
                item.category = category;
                item.model = model;
                item.quantity = stoi(qtyStr);
                item.price = stod(priceStr);
                inventory.push_back(item);
            } catch (...) {
                // skip malformed line
            }
        }
    }

    void displayInventory() const {
        printHeader("CURRENT INVENTORY");
        cout << left
             << setw(5)  << "ID"
             << setw(8)  << "Cat."
             << setw(34) << "Model"
             << right << setw(12) << "Price ($)"
             << setw(10) << "Stock"
             << setw(14) << "Value ($)" << "\n";
        printSeparator('-', 78);

        double totalValue = 0.0;
        int totalUnits = 0;
        for (const auto& item : inventory) {
            double value = item.quantity * item.price;
            totalValue += value;
            totalUnits += item.quantity;
            cout << left
                 << setw(5)  << item.id
                 << setw(8)  << item.category
                 << setw(34) << item.model.substr(0, 33)
                 << right << setw(12) << fixed << setprecision(2) << item.price
                 << setw(10) << item.quantity
                 << setw(14) << value << "\n";
        }
        printSeparator('-', 78);
        cout << left << setw(47) << "TOTALS"
             << right << setw(12) << " "
             << setw(10) << totalUnits
             << setw(14) << fixed << setprecision(2) << totalValue << "\n";
        printSeparator('=', 78);
        cout << "Items in catalog: " << inventory.size() << "\n";
    }

    void filterByCategory() {
        printHeader("FILTER BY CATEGORY");
        cout << "Available categories: CPU, GPU, RAM, SSD, MOBO\n";
        string cat = upper(InputValidator::readNonEmptyString("Enter category: "));

        cout << "\n" << left << setw(5) << "ID" << setw(8) << "Cat."
             << setw(34) << "Model" << right << setw(12) << "Price ($)"
             << setw(10) << "Stock" << "\n";
        printSeparator('-', 69);

        int count = 0;
        for (const auto& item : inventory) {
            if (upper(item.category) == cat) {
                cout << left << setw(5) << item.id << setw(8) << item.category
                     << setw(34) << item.model.substr(0, 33)
                     << right << setw(12) << fixed << setprecision(2) << item.price
                     << setw(10) << item.quantity << "\n";
                count++;
            }
        }
        printSeparator('-', 69);
        cout << "Matches: " << count << "\n";
    }

    void updateStock() {
        printHeader("UPDATE STOCK / PRICE");
        if (inventory.empty()) { cout << "Inventory is empty.\n"; return; }

        int id = InputValidator::readInt("Enter Item ID to update: ", 1, 1000000);
        for (auto& item : inventory) {
            if (item.id == id) {
                cout << "  Editing -> [" << item.category << "] " << item.model << "\n";
                cout << "  Current price: $" << fixed << setprecision(2) << item.price
                     << "  | Current stock: " << item.quantity << "\n";

                double newPrice = InputValidator::readDouble("New price ($): ", 0.01, 100000.0);
                int addQty = InputValidator::readInt("Quantity to add (0 to keep): ", 0, 100000);

                item.price = newPrice;
                item.quantity += addQty;
                saveToFile();
                cout << "  >> Update successful. New stock: " << item.quantity << "\n";
                return;
            }
        }
        cout << "  [!] ID not found.\n";
    }

    void sellItem() {
        printHeader("RECORD SALE");
        if (inventory.empty()) { cout << "Inventory is empty.\n"; return; }

        int id = InputValidator::readInt("Enter Item ID to sell: ", 1, 1000000);
        for (auto& item : inventory) {
            if (item.id == id) {
                cout << "  Selling -> [" << item.category << "] " << item.model << "\n";
                cout << "  Available stock: " << item.quantity
                     << " | Unit price: $" << fixed << setprecision(2) << item.price << "\n";

                if (item.quantity == 0) {
                    cout << "  [!] Out of stock.\n";
                    return;
                }

                int qty = InputValidator::readInt("Quantity to sell: ", 1, item.quantity);
                double total = qty * item.price;
                item.quantity -= qty;
                saveToFile();
                logSale(item, qty, total);

                cout << "\n  ---- RECEIPT ----\n";
                cout << "  Date:     " << currentTimestamp() << "\n";
                cout << "  Item:     " << item.model << "\n";
                cout << "  Quantity: " << qty << "\n";
                cout << "  Unit:     $" << fixed << setprecision(2) << item.price << "\n";
                cout << "  TOTAL:    $" << fixed << setprecision(2) << total << "\n";
                cout << "  Remaining stock: " << item.quantity << "\n";
                cout << "  -----------------\n";
                return;
            }
        }
        cout << "  [!] ID not found.\n";
    }

    void addItem() {
        printHeader("ADD NEW COMPONENT");
        Component item;
        item.id = nextId();
        cout << "  Auto-assigned ID: " << item.id << "\n";

        item.category = upper(InputValidator::readNonEmptyString("Category (CPU/GPU/RAM/SSD/MOBO/...): "));
        item.model    = InputValidator::readNonEmptyString("Model name: ");
        item.quantity = InputValidator::readInt("Initial quantity: ", 0, 100000);
        item.price    = InputValidator::readDouble("Unit price ($): ", 0.01, 100000.0);

        inventory.push_back(item);
        saveToFile();
        cout << "  >> Component added successfully.\n";
    }

    void removeItem() {
        printHeader("REMOVE COMPONENT");
        if (inventory.empty()) { cout << "Inventory is empty.\n"; return; }

        int id = InputValidator::readInt("Enter Item ID to remove: ", 1, 1000000);
        auto it = find_if(inventory.begin(), inventory.end(),
                          [id](const Component& c) { return c.id == id; });
        if (it == inventory.end()) {
            cout << "  [!] ID not found.\n";
            return;
        }

        cout << "  About to remove [" << it->category << "] " << it->model << "\n";
        char confirm = InputValidator::readYesNo("Confirm removal? (y/n): ");
        if (confirm == 'y') {
            inventory.erase(it);
            saveToFile();
            cout << "  >> Component removed.\n";
        } else {
            cout << "  Cancelled.\n";
        }
    }

    void searchByModel() {
        printHeader("SEARCH BY MODEL");
        string keyword = upper(InputValidator::readNonEmptyString("Enter keyword: "));

        cout << "\n" << left << setw(5) << "ID" << setw(8) << "Cat."
             << setw(34) << "Model" << right << setw(12) << "Price ($)"
             << setw(10) << "Stock" << "\n";
        printSeparator('-', 69);

        int count = 0;
        for (const auto& item : inventory) {
            if (upper(item.model).find(keyword) != string::npos) {
                cout << left << setw(5) << item.id << setw(8) << item.category
                     << setw(34) << item.model.substr(0, 33)
                     << right << setw(12) << fixed << setprecision(2) << item.price
                     << setw(10) << item.quantity << "\n";
                count++;
            }
        }
        printSeparator('-', 69);
        cout << "Matches: " << count << "\n";
    }

    void viewSalesHistory() const {
        printHeader("SALES HISTORY");
        ifstream log(salesLogFile);
        if (!log.is_open()) {
            cout << "  No sales recorded yet.\n";
            return;
        }

        cout << left
             << setw(21) << "Date"
             << setw(6)  << "ID"
             << setw(8)  << "Cat."
             << setw(28) << "Model"
             << right << setw(6)  << "Qty"
             << setw(12) << "Unit ($)"
             << setw(13) << "Total ($)" << "\n";
        printSeparator('-', 94);

        string line;
        bool first = true;
        int totalSales = 0;
        double totalRevenue = 0.0;

        while (getline(log, line)) {
            if (line.empty()) continue;
            if (first) { first = false; continue; }

            stringstream ss(line);
            string ts, idStr, cat, model, qtyStr, unitStr, totalStr;
            if (!getline(ss, ts, '|')) continue;
            if (!getline(ss, idStr, '|')) continue;
            if (!getline(ss, cat, '|')) continue;
            if (!getline(ss, model, '|')) continue;
            if (!getline(ss, qtyStr, '|')) continue;
            if (!getline(ss, unitStr, '|')) continue;
            if (!getline(ss, totalStr)) continue;

            try {
                int qty = stoi(qtyStr);
                double unit = stod(unitStr);
                double total = stod(totalStr);
                cout << left
                     << setw(21) << ts
                     << setw(6)  << idStr
                     << setw(8)  << cat
                     << setw(28) << model.substr(0, 27)
                     << right << setw(6)  << qty
                     << setw(12) << fixed << setprecision(2) << unit
                     << setw(13) << total << "\n";
                totalSales++;
                totalRevenue += total;
            } catch (...) {
                continue;
            }
        }

        printSeparator('-', 94);
        cout << "Transactions: " << totalSales
             << "    |    Total revenue: $" << fixed << setprecision(2) << totalRevenue << "\n";
    }

    void dailyRevenueSummary() const {
        printHeader("DAILY REVENUE SUMMARY");
        ifstream log(salesLogFile);
        if (!log.is_open()) {
            cout << "  No sales recorded yet.\n";
            return;
        }

        vector<pair<string, double>> daily;

        string line;
        bool first = true;
        while (getline(log, line)) {
            if (line.empty()) continue;
            if (first) { first = false; continue; }

            stringstream ss(line);
            string ts, idStr, cat, model, qtyStr, unitStr, totalStr;
            if (!getline(ss, ts, '|')) continue;
            if (!getline(ss, idStr, '|')) continue;
            if (!getline(ss, cat, '|')) continue;
            if (!getline(ss, model, '|')) continue;
            if (!getline(ss, qtyStr, '|')) continue;
            if (!getline(ss, unitStr, '|')) continue;
            if (!getline(ss, totalStr)) continue;

            string date = ts.substr(0, 10);
            double total = 0.0;
            try { total = stod(totalStr); } catch (...) { continue; }

            bool found = false;
            for (auto& d : daily) {
                if (d.first == date) { d.second += total; found = true; break; }
            }
            if (!found) daily.push_back({date, total});
        }

        if (daily.empty()) {
            cout << "  No sales recorded yet.\n";
            return;
        }

        sort(daily.begin(), daily.end(),
             [](const pair<string,double>& a, const pair<string,double>& b) {
                 return a.first < b.first;
             });

        double maxRevenue = 0.0;
        double grandTotal = 0.0;
        for (const auto& d : daily) {
            if (d.second > maxRevenue) maxRevenue = d.second;
            grandTotal += d.second;
        }

        const int barWidth = 40;
        cout << left << setw(13) << "Date"
             << right << setw(13) << "Revenue ($)"
             << "   " << left << "Chart\n";
        printSeparator('-', 78);

        for (const auto& d : daily) {
            int barLen = (maxRevenue > 0)
                ? static_cast<int>((d.second / maxRevenue) * barWidth + 0.5)
                : 0;
            if (barLen == 0 && d.second > 0) barLen = 1;

            cout << left << setw(13) << d.first
                 << right << setw(13) << fixed << setprecision(2) << d.second
                 << "   " << string(barLen, '#') << "\n";
        }

        printSeparator('-', 78);
        cout << "Days with sales: " << daily.size()
             << "    |    Grand total: $" << fixed << setprecision(2) << grandTotal
             << "    |    Avg/day: $" << (grandTotal / daily.size()) << "\n";
    }

    void categoryRevenueBreakdown() const {
        printHeader("REVENUE BY CATEGORY");
        ifstream log(salesLogFile);
        if (!log.is_open()) {
            cout << "  No sales recorded yet.\n";
            return;
        }

        vector<pair<string, double>> byCat;
        vector<pair<string, int>> unitsByCat;

        string line;
        bool first = true;
        while (getline(log, line)) {
            if (line.empty()) continue;
            if (first) { first = false; continue; }

            stringstream ss(line);
            string ts, idStr, cat, model, qtyStr, unitStr, totalStr;
            if (!getline(ss, ts, '|')) continue;
            if (!getline(ss, idStr, '|')) continue;
            if (!getline(ss, cat, '|')) continue;
            if (!getline(ss, model, '|')) continue;
            if (!getline(ss, qtyStr, '|')) continue;
            if (!getline(ss, unitStr, '|')) continue;
            if (!getline(ss, totalStr)) continue;

            double total = 0.0;
            int qty = 0;
            try {
                total = stod(totalStr);
                qty = stoi(qtyStr);
            } catch (...) { continue; }

            bool found = false;
            for (auto& c : byCat) {
                if (c.first == cat) { c.second += total; found = true; break; }
            }
            if (!found) byCat.push_back({cat, total});

            bool foundU = false;
            for (auto& c : unitsByCat) {
                if (c.first == cat) { c.second += qty; foundU = true; break; }
            }
            if (!foundU) unitsByCat.push_back({cat, qty});
        }

        if (byCat.empty()) {
            cout << "  No sales recorded yet.\n";
            return;
        }

        sort(byCat.begin(), byCat.end(),
             [](const pair<string,double>& a, const pair<string,double>& b) {
                 return a.second > b.second;
             });

        double maxRevenue = byCat.front().second;
        double grandTotal = 0.0;
        for (const auto& c : byCat) grandTotal += c.second;

        const int barWidth = 30;
        cout << left << setw(10) << "Category"
             << right << setw(8)  << "Units"
             << setw(13) << "Revenue ($)"
             << setw(8)  << "Share"
             << "   " << left << "Chart\n";
        printSeparator('-', 78);

        for (const auto& c : byCat) {
            int units = 0;
            for (const auto& u : unitsByCat) {
                if (u.first == c.first) { units = u.second; break; }
            }
            double share = (grandTotal > 0) ? (c.second / grandTotal) * 100.0 : 0.0;
            int barLen = (maxRevenue > 0)
                ? static_cast<int>((c.second / maxRevenue) * barWidth + 0.5)
                : 0;
            if (barLen == 0 && c.second > 0) barLen = 1;

            ostringstream pct;
            pct << fixed << setprecision(1) << share << "%";

            cout << left << setw(10) << c.first
                 << right << setw(8)  << units
                 << setw(13) << fixed << setprecision(2) << c.second
                 << setw(8)  << pct.str()
                 << "   " << string(barLen, '#') << "\n";
        }

        printSeparator('-', 78);
        cout << "Categories with sales: " << byCat.size()
             << "    |    Grand total: $" << fixed << setprecision(2) << grandTotal
             << "    |    Top: " << byCat.front().first
             << " ($" << byCat.front().second << ")\n";
    }

    void lowStockReport() {
        printHeader("LOW STOCK REPORT");
        int threshold = InputValidator::readInt("Threshold (items at or below): ", 0, 100000);

        cout << "\n" << left << setw(5) << "ID" << setw(8) << "Cat."
             << setw(34) << "Model" << right << setw(10) << "Stock" << "\n";
        printSeparator('-', 57);

        int count = 0;
        for (const auto& item : inventory) {
            if (item.quantity <= threshold) {
                cout << left << setw(5) << item.id << setw(8) << item.category
                     << setw(34) << item.model.substr(0, 33)
                     << right << setw(10) << item.quantity << "\n";
                count++;
            }
        }
        printSeparator('-', 57);
        cout << "Items at or below " << threshold << ": " << count << "\n";
    }
};

void showMenu() {
    cout << "\n";
    cout << "+============================================================+\n";
    cout << "|         PC COMPONENTS WAREHOUSE MANAGEMENT - PRO           |\n";
    cout << "+============================================================+\n";
    cout << "|  1. View Full Inventory                                    |\n";
    cout << "|  2. Filter by Category                                     |\n";
    cout << "|  3. Search by Model                                        |\n";
    cout << "|  4. Update Stock / Price                                   |\n";
    cout << "|  5. Record a Sale                                          |\n";
    cout << "|  6. Add New Component                                      |\n";
    cout << "|  7. Remove Component                                       |\n";
    cout << "|  8. Low Stock Report                                       |\n";
    cout << "|  9. View Sales History                                     |\n";
    cout << "| 10. Daily Revenue Summary                                  |\n";
    cout << "| 11. Revenue by Category                                    |\n";
    cout << "| 12. Exit                                                   |\n";
    cout << "+============================================================+\n";
}

int main() {
    WarehouseSystem ws;
    int choice = 0;

    do {
        showMenu();
        choice = InputValidator::readInt("Select an option [1-12]: ", 1, 12);

        switch (choice) {
            case 1:  ws.displayInventory(); break;
            case 2:  ws.filterByCategory(); break;
            case 3:  ws.searchByModel(); break;
            case 4:  ws.updateStock(); break;
            case 5:  ws.sellItem(); break;
            case 6:  ws.addItem(); break;
            case 7:  ws.removeItem(); break;
            case 8:  ws.lowStockReport(); break;
            case 9:  ws.viewSalesHistory(); break;
            case 10: ws.dailyRevenueSummary(); break;
            case 11: ws.categoryRevenueBreakdown(); break;
            case 12:
                cout << "\nAll changes saved to inventory.csv and sales_history.csv. Goodbye!\n";
                break;
        }
    } while (choice != 12);

    return 0;
}
