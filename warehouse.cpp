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
#include <map>

using namespace std;

// =====================================================================
//  ANSI COLOR / STYLE HELPERS
// =====================================================================
namespace ansi {
    const string RESET   = "\033[0m";
    const string BOLD    = "\033[1m";
    const string DIM     = "\033[2m";
    const string RED     = "\033[31m";
    const string GREEN   = "\033[32m";
    const string YELLOW  = "\033[33m";
    const string BLUE    = "\033[34m";
    const string MAGENTA = "\033[35m";
    const string CYAN    = "\033[36m";
    const string WHITE   = "\033[37m";
    const string BG_RED  = "\033[41m";
    const string BG_BLUE = "\033[44m";
}

// Stock threshold: any stock strictly below this is highlighted red.
static const int LOW_STOCK_THRESHOLD = 3;

struct Component {
    int id;
    string category;
    string model;
    int quantity;
    double price;
};

// =====================================================================
//  SMART SUGGESTIONS DATABASE
//  Approximate market prices in USD (reference values).
// =====================================================================
struct Suggestion {
    string model;
    double approxPrice;
};

static const map<string, vector<Suggestion>> SMART_SUGGESTIONS = {
    {"CPU", {
        {"Intel Core i3-13100",       130.00},
        {"Intel Core i5-13400",       230.00},
        {"Intel Core i5-14600K",      320.00},
        {"Intel Core i7-13700K",      410.00},
        {"Intel Core i7-14700K",      440.00},
        {"Intel Core i9-14900K",      580.00},
        {"AMD Ryzen 5 7600X",         250.00},
        {"AMD Ryzen 5 8600G",         260.00},
        {"AMD Ryzen 7 7800X3D",       450.00},
        {"AMD Ryzen 7 9700X",         410.00},
        {"AMD Ryzen 9 7950X",         620.00},
        {"AMD Ryzen 9 9950X",         700.00}
    }},
    {"GPU", {
        {"NVIDIA RTX 4060",           300.00},
        {"NVIDIA RTX 4060 Ti 16GB",   460.00},
        {"NVIDIA RTX 4070 Super",     620.00},
        {"NVIDIA RTX 4070 Ti Super",  820.00},
        {"NVIDIA RTX 4080 Super",    1100.00},
        {"NVIDIA RTX 4090",          1600.00},
        {"AMD RX 7600",               280.00},
        {"AMD RX 7700 XT",            450.00},
        {"AMD RX 7800 XT",            500.00},
        {"AMD RX 7900 XT",            720.00},
        {"AMD RX 7900 XTX",           950.00},
        {"Intel Arc A770 16GB",       320.00}
    }},
    {"RAM", {
        {"Corsair Vengeance 16GB DDR4 3200",   45.00},
        {"G.Skill Ripjaws 32GB DDR4 3600",     85.00},
        {"Crucial 16GB DDR5 5600",             65.00},
        {"Kingston Fury 32GB DDR5 6000",      120.00},
        {"G.Skill Trident Z5 32GB DDR5 6400", 140.00},
        {"Corsair Dominator 64GB DDR5 6400",  210.00},
        {"Corsair Vengeance 64GB DDR5 6000",  185.00}
    }},
    {"SSD", {
        {"Kingston NV2 500GB NVMe",            45.00},
        {"Samsung 970 EVO Plus 1TB NVMe",      80.00},
        {"Kingston KC3000 1TB",               100.00},
        {"WD Black SN850X 2TB",               160.00},
        {"Samsung 990 Pro 2TB",               220.00},
        {"Crucial T700 4TB Gen5",             400.00},
        {"Samsung 870 EVO 1TB SATA",           75.00}
    }},
    {"MOBO", {
        {"ASUS Prime B760-Plus",              140.00},
        {"ASRock B650M Pro RS",               160.00},
        {"MSI MAG B650 Tomahawk",             230.00},
        {"Gigabyte X670E Aorus Elite",        450.00},
        {"ASUS ROG Strix Z790-E",             480.00},
        {"ASUS ROG Maximus Z790 Hero",        600.00},
        {"MSI MEG Z790 Ace",                  720.00},
        {"ASUS ProArt X670E Creator",         500.00}
    }},
    {"PSU", {
        {"Corsair CX650M 650W Bronze",         75.00},
        {"EVGA SuperNOVA 750W Gold",          120.00},
        {"Corsair RM850x 850W Gold",          160.00},
        {"Seasonic Focus GX-1000 1000W Gold", 210.00},
        {"be quiet! Dark Power 13 1300W",     320.00}
    }},
    {"CASE", {
        {"NZXT H5 Flow",                       95.00},
        {"Lian Li Lancool 216",               110.00},
        {"Fractal Design North",              140.00},
        {"Corsair 5000D Airflow",             170.00},
        {"Lian Li O11 Dynamic EVO",           190.00}
    }},
    {"COOLER", {
        {"Cooler Master Hyper 212 Black",      45.00},
        {"DeepCool AK620",                     65.00},
        {"Noctua NH-D15",                     120.00},
        {"Arctic Liquid Freezer III 360",     130.00},
        {"Corsair iCUE H150i Elite LCD",      280.00}
    }}
};

// =====================================================================
//  INPUT VALIDATOR
// =====================================================================
class InputValidator {
public:
    static void clearBuffer() {
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    static int readInt(const string& prompt, int minVal, int maxVal) {
        int value;
        while (true) {
            cout << ansi::CYAN << prompt << ansi::RESET;
            if (cin >> value && value >= minVal && value <= maxVal) {
                clearBuffer();
                return value;
            }
            clearBuffer();
            cout << ansi::RED << "  [!] Invalid input. Please enter an integer between "
                 << minVal << " and " << maxVal << "." << ansi::RESET << "\n";
        }
    }

    static double readDouble(const string& prompt, double minVal, double maxVal) {
        double value;
        while (true) {
            cout << ansi::CYAN << prompt << ansi::RESET;
            if (cin >> value && value >= minVal && value <= maxVal) {
                clearBuffer();
                return value;
            }
            clearBuffer();
            cout << ansi::RED << "  [!] Invalid input. Please enter a number between "
                 << fixed << setprecision(2) << minVal << " and " << maxVal
                 << "." << ansi::RESET << "\n";
        }
    }

    static string readNonEmptyString(const string& prompt) {
        string value;
        while (true) {
            cout << ansi::CYAN << prompt << ansi::RESET;
            getline(cin, value);
            value.erase(0, value.find_first_not_of(" \t\r\n"));
            value.erase(value.find_last_not_of(" \t\r\n") + 1);
            if (!value.empty() && value.find('|') == string::npos) return value;
            cout << ansi::RED << "  [!] Value cannot be empty or contain the '|' character."
                 << ansi::RESET << "\n";
        }
    }

    // Like readNonEmptyString but accepts an empty input (returns "").
    static string readOptionalString(const string& prompt) {
        string value;
        cout << ansi::CYAN << prompt << ansi::RESET;
        getline(cin, value);
        value.erase(0, value.find_first_not_of(" \t\r\n"));
        value.erase(value.find_last_not_of(" \t\r\n") + 1);
        if (value.find('|') != string::npos) {
            cout << ansi::RED << "  [!] '|' is not allowed; ignored input." << ansi::RESET << "\n";
            return "";
        }
        return value;
    }

    static char readYesNo(const string& prompt) {
        string value;
        while (true) {
            cout << ansi::CYAN << prompt << ansi::RESET;
            getline(cin, value);
            if (!value.empty()) {
                char c = static_cast<char>(tolower(value[0]));
                if (c == 'y' || c == 'n') return c;
            }
            cout << ansi::RED << "  [!] Please answer with 'y' or 'n'." << ansi::RESET << "\n";
        }
    }
};

// =====================================================================
//  WAREHOUSE SYSTEM
// =====================================================================
class WarehouseSystem {
private:
    vector<Component> inventory;
    const string fileName     = "inventory.csv";
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
            cout << ansi::RED << "  [!] Warning: could not open '" << salesLogFile
                 << "' for writing." << ansi::RESET << "\n";
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

    // Auto-generate the next ID by scanning the existing database.
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

    string stockColor(int q) const {
        if (q < LOW_STOCK_THRESHOLD) return ansi::BOLD + ansi::RED;
        if (q < LOW_STOCK_THRESHOLD * 3) return ansi::YELLOW;
        return ansi::GREEN;
    }

    // Box-drawing helpers (UTF-8).
    void printTopBorder(int width) const {
        cout << ansi::BLUE << "+" << string(width - 2, '=') << "+" << ansi::RESET << "\n";
    }
    void printMidBorder(int width) const {
        cout << ansi::BLUE << "+" << string(width - 2, '-') << "+" << ansi::RESET << "\n";
    }
    void printBottomBorder(int width) const {
        cout << ansi::BLUE << "+" << string(width - 2, '=') << "+" << ansi::RESET << "\n";
    }

    void printHeader(const string& title) const {
        const int width = 82;
        cout << "\n";
        printTopBorder(width);
        int innerWidth = width - 2;
        int pad = (innerWidth - static_cast<int>(title.size())) / 2;
        int rightPad = innerWidth - pad - static_cast<int>(title.size());
        cout << ansi::BLUE << "|" << ansi::RESET
             << string(pad, ' ')
             << ansi::BOLD << ansi::CYAN << title << ansi::RESET
             << string(rightPad, ' ')
             << ansi::BLUE << "|" << ansi::RESET << "\n";
        printTopBorder(width);
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
            cout << ansi::RED << "  [!] Warning: could not open '" << fileName
                 << "' for writing." << ansi::RESET << "\n";
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
                item.id       = stoi(idStr);
                item.category = category;
                item.model    = model;
                item.quantity = stoi(qtyStr);
                item.price    = stod(priceStr);
                inventory.push_back(item);
            } catch (...) {
                // skip malformed line
            }
        }
    }

    void displayInventory() const {
        printHeader("CURRENT INVENTORY");

        cout << ansi::BOLD
             << left  << setw(5)  << "ID"
             << setw(8)  << "Cat."
             << setw(36) << "Model"
             << right << setw(12) << "Price ($)"
             << setw(9)  << "Stock"
             << setw(14) << "Value ($)"
             << ansi::RESET << "\n";
        cout << ansi::DIM << string(82, '-') << ansi::RESET << "\n";

        double totalValue = 0.0;
        int totalUnits = 0;
        int lowCount = 0;
        for (const auto& item : inventory) {
            double value = item.quantity * item.price;
            totalValue += value;
            totalUnits += item.quantity;

            bool low = item.quantity < LOW_STOCK_THRESHOLD;
            if (low) lowCount++;

            string rowColor = low ? (ansi::BOLD + ansi::RED) : "";
            string reset    = low ? ansi::RESET : "";

            cout << rowColor
                 << left  << setw(5)  << item.id
                 << setw(8)  << item.category
                 << setw(36) << item.model.substr(0, 35)
                 << right << setw(12) << fixed << setprecision(2) << item.price
                 << setw(9)  << item.quantity
                 << setw(14) << value
                 << (low ? "  <- LOW" : "")
                 << reset << "\n";
        }
        cout << ansi::DIM << string(82, '-') << ansi::RESET << "\n";
        cout << ansi::BOLD
             << left  << setw(49) << "TOTALS"
             << right << setw(12) << " "
             << setw(9)  << totalUnits
             << setw(14) << fixed << setprecision(2) << totalValue
             << ansi::RESET << "\n";
        printBottomBorder(82);
        cout << "Items in catalog: " << ansi::BOLD << inventory.size() << ansi::RESET;
        if (lowCount > 0) {
            cout << "    " << ansi::BOLD << ansi::RED
                 << "Low-stock alerts: " << lowCount
                 << " (below " << LOW_STOCK_THRESHOLD << " units)" << ansi::RESET;
        }
        cout << "\n";
    }

    void filterByCategory() {
        printHeader("FILTER BY CATEGORY");
        cout << ansi::DIM << "Available categories: ";
        bool firstCat = true;
        for (const auto& kv : SMART_SUGGESTIONS) {
            if (!firstCat) cout << ", ";
            cout << kv.first;
            firstCat = false;
        }
        cout << ansi::RESET << "\n";

        string cat = upper(InputValidator::readNonEmptyString("Enter category: "));

        cout << "\n" << ansi::BOLD
             << left  << setw(5)  << "ID"
             << setw(8)  << "Cat."
             << setw(36) << "Model"
             << right << setw(12) << "Price ($)"
             << setw(9)  << "Stock"
             << ansi::RESET << "\n";
        cout << ansi::DIM << string(70, '-') << ansi::RESET << "\n";

        int count = 0;
        for (const auto& item : inventory) {
            if (upper(item.category) == cat) {
                bool low = item.quantity < LOW_STOCK_THRESHOLD;
                string rowColor = low ? (ansi::BOLD + ansi::RED) : "";
                string reset    = low ? ansi::RESET : "";
                cout << rowColor
                     << left  << setw(5)  << item.id
                     << setw(8)  << item.category
                     << setw(36) << item.model.substr(0, 35)
                     << right << setw(12) << fixed << setprecision(2) << item.price
                     << setw(9)  << item.quantity
                     << reset << "\n";
                count++;
            }
        }
        cout << ansi::DIM << string(70, '-') << ansi::RESET << "\n";
        cout << "Matches: " << ansi::BOLD << count << ansi::RESET << "\n";
    }

    void updateStock() {
        printHeader("UPDATE STOCK / PRICE");
        if (inventory.empty()) { cout << "Inventory is empty.\n"; return; }

        int id = InputValidator::readInt("Enter Item ID to update: ", 1, 1000000);
        for (auto& item : inventory) {
            if (item.id == id) {
                cout << "  Editing -> [" << ansi::CYAN << item.category << ansi::RESET
                     << "] " << ansi::BOLD << item.model << ansi::RESET << "\n";
                cout << "  Current price: $" << fixed << setprecision(2) << item.price
                     << "  | Current stock: "
                     << stockColor(item.quantity) << item.quantity << ansi::RESET << "\n";

                double newPrice = InputValidator::readDouble("New price ($): ", 0.01, 100000.0);
                int addQty      = InputValidator::readInt("Quantity to add (0 to keep): ", 0, 100000);

                item.price     = newPrice;
                item.quantity += addQty;
                saveToFile();
                cout << ansi::GREEN << "  >> Update successful. New stock: "
                     << item.quantity << ansi::RESET << "\n";
                return;
            }
        }
        cout << ansi::RED << "  [!] ID not found." << ansi::RESET << "\n";
    }

    void sellItem() {
        printHeader("RECORD SALE");
        if (inventory.empty()) { cout << "Inventory is empty.\n"; return; }

        int id = InputValidator::readInt("Enter Item ID to sell: ", 1, 1000000);
        for (auto& item : inventory) {
            if (item.id == id) {
                cout << "  Selling -> [" << ansi::CYAN << item.category << ansi::RESET
                     << "] " << ansi::BOLD << item.model << ansi::RESET << "\n";
                cout << "  Available stock: "
                     << stockColor(item.quantity) << item.quantity << ansi::RESET
                     << " | Unit price: $" << fixed << setprecision(2) << item.price << "\n";

                if (item.quantity == 0) {
                    cout << ansi::RED << "  [!] Out of stock." << ansi::RESET << "\n";
                    return;
                }

                int qty = InputValidator::readInt("Quantity to sell: ", 1, item.quantity);
                double total = qty * item.price;
                item.quantity -= qty;
                saveToFile();
                logSale(item, qty, total);

                cout << "\n  " << ansi::BOLD << "---- RECEIPT ----" << ansi::RESET << "\n";
                cout << "  Date:     " << currentTimestamp() << "\n";
                cout << "  Item:     " << item.model << "\n";
                cout << "  Quantity: " << qty << "\n";
                cout << "  Unit:     $" << fixed << setprecision(2) << item.price << "\n";
                cout << "  " << ansi::BOLD << ansi::GREEN
                     << "TOTAL:    $" << fixed << setprecision(2) << total
                     << ansi::RESET << "\n";
                cout << "  Remaining stock: "
                     << stockColor(item.quantity) << item.quantity << ansi::RESET << "\n";
                cout << "  -----------------\n";
                return;
            }
        }
        cout << ansi::RED << "  [!] ID not found." << ansi::RESET << "\n";
    }

    // -----------------------------------------------------------------
    //  SMART ADD ITEM
    // -----------------------------------------------------------------
    void addItem() {
        printHeader("ADD NEW COMPONENT (SMART MODE)");

        Component item;
        item.id = nextId(); // Auto-assigned, derived from existing DB.
        cout << "  " << ansi::DIM << "Auto-assigned ID:" << ansi::RESET
             << " " << ansi::BOLD << ansi::GREEN << item.id << ansi::RESET << "\n\n";

        // -- 1) Category selection from the suggestions catalog --
        cout << ansi::BOLD << "Step 1 - Choose a category:" << ansi::RESET << "\n";
        vector<string> categories;
        int idx = 1;
        for (const auto& kv : SMART_SUGGESTIONS) {
            categories.push_back(kv.first);
            cout << "  " << ansi::CYAN << setw(2) << idx << ansi::RESET
                 << ". " << kv.first << "\n";
            idx++;
        }
        cout << "  " << ansi::CYAN << " 0" << ansi::RESET
             << ". Custom category (enter manually)\n";

        int catChoice = InputValidator::readInt(
            "Select category number: ", 0, static_cast<int>(categories.size()));

        if (catChoice == 0) {
            item.category = upper(InputValidator::readNonEmptyString("Custom category name: "));
        } else {
            item.category = categories[catChoice - 1];
        }
        cout << "  " << ansi::DIM << "Selected category:" << ansi::RESET
             << " " << ansi::BOLD << item.category << ansi::RESET << "\n\n";

        // -- 2) Smart model suggestions for the chosen category --
        cout << ansi::BOLD << "Step 2 - Smart suggestions:" << ansi::RESET << "\n";
        auto sugIt = SMART_SUGGESTIONS.find(item.category);
        const vector<Suggestion>* suggestions = nullptr;
        if (sugIt != SMART_SUGGESTIONS.end()) {
            suggestions = &sugIt->second;
            cout << ansi::DIM << string(70, '-') << ansi::RESET << "\n";
            cout << ansi::BOLD
                 << left  << setw(5)  << "  #"
                 << setw(50) << "Model"
                 << right << setw(15) << "Approx. ($)"
                 << ansi::RESET << "\n";
            cout << ansi::DIM << string(70, '-') << ansi::RESET << "\n";
            for (size_t i = 0; i < suggestions->size(); ++i) {
                cout << left  << setw(5)
                     << ("  " + to_string(i + 1))
                     << setw(50) << (*suggestions)[i].model.substr(0, 49)
                     << right << setw(15)
                     << fixed << setprecision(2) << (*suggestions)[i].approxPrice
                     << "\n";
            }
            cout << ansi::DIM << string(70, '-') << ansi::RESET << "\n";
            cout << "  " << ansi::CYAN << " 0" << ansi::RESET
                 << ". Enter custom model manually\n";

            int modelChoice = InputValidator::readInt(
                "Select model number: ", 0, static_cast<int>(suggestions->size()));

            if (modelChoice == 0) {
                item.model = InputValidator::readNonEmptyString("Custom model name: ");
                item.price = InputValidator::readDouble("Unit price ($): ", 0.01, 100000.0);
            } else {
                const Suggestion& chosen = (*suggestions)[modelChoice - 1];
                item.model = chosen.model;

                // -- 3) Suggested market price --
                cout << "\n  " << ansi::DIM << "Approximate market price for "
                     << ansi::RESET << ansi::BOLD << chosen.model << ansi::RESET
                     << ": " << ansi::BOLD << ansi::GREEN
                     << "$" << fixed << setprecision(2) << chosen.approxPrice
                     << ansi::RESET << "\n";

                char accept = InputValidator::readYesNo(
                    "Accept the suggested price? (y/n): ");
                if (accept == 'y') {
                    item.price = chosen.approxPrice;
                } else {
                    item.price = InputValidator::readDouble(
                        "Enter your custom unit price ($): ", 0.01, 100000.0);
                }
            }
        } else {
            cout << ansi::YELLOW
                 << "  No smart suggestions available for category '"
                 << item.category << "'. Please enter details manually."
                 << ansi::RESET << "\n";
            item.model = InputValidator::readNonEmptyString("Model name: ");
            item.price = InputValidator::readDouble("Unit price ($): ", 0.01, 100000.0);
        }

        cout << "\n";
        item.quantity = InputValidator::readInt(
            "Step 3 - Initial quantity in stock: ", 0, 100000);

        // -- Confirm summary --
        cout << "\n" << ansi::BOLD << "Summary of new component:" << ansi::RESET << "\n";
        cout << "  ID       : " << ansi::GREEN << item.id << ansi::RESET << "\n";
        cout << "  Category : " << item.category << "\n";
        cout << "  Model    : " << item.model << "\n";
        cout << "  Price    : $" << fixed << setprecision(2) << item.price << "\n";
        cout << "  Stock    : " << stockColor(item.quantity) << item.quantity
             << ansi::RESET;
        if (item.quantity < LOW_STOCK_THRESHOLD)
            cout << ansi::RED << "  (low!)" << ansi::RESET;
        cout << "\n";

        char confirm = InputValidator::readYesNo("Save this component? (y/n): ");
        if (confirm != 'y') {
            cout << ansi::YELLOW << "  Cancelled. Nothing was saved." << ansi::RESET << "\n";
            return;
        }

        inventory.push_back(item);
        saveToFile(); // persist to local CSV container
        cout << ansi::GREEN
             << "  >> Component added successfully and synced to '"
             << fileName << "'." << ansi::RESET << "\n";
    }

    void removeItem() {
        printHeader("REMOVE COMPONENT");
        if (inventory.empty()) { cout << "Inventory is empty.\n"; return; }

        int id = InputValidator::readInt("Enter Item ID to remove: ", 1, 1000000);
        auto it = find_if(inventory.begin(), inventory.end(),
                          [id](const Component& c) { return c.id == id; });
        if (it == inventory.end()) {
            cout << ansi::RED << "  [!] ID not found." << ansi::RESET << "\n";
            return;
        }

        cout << "  About to remove [" << ansi::CYAN << it->category << ansi::RESET
             << "] " << ansi::BOLD << it->model << ansi::RESET << "\n";
        char confirm = InputValidator::readYesNo("Confirm removal? (y/n): ");
        if (confirm == 'y') {
            inventory.erase(it);
            saveToFile();
            cout << ansi::GREEN << "  >> Component removed." << ansi::RESET << "\n";
        } else {
            cout << ansi::YELLOW << "  Cancelled." << ansi::RESET << "\n";
        }
    }

    void searchByModel() {
        printHeader("SEARCH BY MODEL");
        string keyword = upper(InputValidator::readNonEmptyString("Enter keyword: "));

        cout << "\n" << ansi::BOLD
             << left  << setw(5)  << "ID"
             << setw(8)  << "Cat."
             << setw(36) << "Model"
             << right << setw(12) << "Price ($)"
             << setw(9)  << "Stock"
             << ansi::RESET << "\n";
        cout << ansi::DIM << string(70, '-') << ansi::RESET << "\n";

        int count = 0;
        for (const auto& item : inventory) {
            if (upper(item.model).find(keyword) != string::npos) {
                bool low = item.quantity < LOW_STOCK_THRESHOLD;
                string rowColor = low ? (ansi::BOLD + ansi::RED) : "";
                string reset    = low ? ansi::RESET : "";
                cout << rowColor
                     << left  << setw(5)  << item.id
                     << setw(8)  << item.category
                     << setw(36) << item.model.substr(0, 35)
                     << right << setw(12) << fixed << setprecision(2) << item.price
                     << setw(9)  << item.quantity
                     << reset << "\n";
                count++;
            }
        }
        cout << ansi::DIM << string(70, '-') << ansi::RESET << "\n";
        cout << "Matches: " << ansi::BOLD << count << ansi::RESET << "\n";
    }

    void viewSalesHistory() const {
        printHeader("SALES HISTORY");
        ifstream log(salesLogFile);
        if (!log.is_open()) {
            cout << "  No sales recorded yet.\n";
            return;
        }

        cout << ansi::BOLD
             << left  << setw(21) << "Date"
             << setw(6)  << "ID"
             << setw(8)  << "Cat."
             << setw(28) << "Model"
             << right << setw(6)  << "Qty"
             << setw(12) << "Unit ($)"
             << setw(13) << "Total ($)"
             << ansi::RESET << "\n";
        cout << ansi::DIM << string(94, '-') << ansi::RESET << "\n";

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
                cout << left  << setw(21) << ts
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

        cout << ansi::DIM << string(94, '-') << ansi::RESET << "\n";
        cout << "Transactions: " << ansi::BOLD << totalSales << ansi::RESET
             << "    |    Total revenue: " << ansi::BOLD << ansi::GREEN
             << "$" << fixed << setprecision(2) << totalRevenue
             << ansi::RESET << "\n";
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
        cout << ansi::BOLD
             << left  << setw(13) << "Date"
             << right << setw(13) << "Revenue ($)"
             << "   " << left << "Chart"
             << ansi::RESET << "\n";
        cout << ansi::DIM << string(78, '-') << ansi::RESET << "\n";

        for (const auto& d : daily) {
            int barLen = (maxRevenue > 0)
                ? static_cast<int>((d.second / maxRevenue) * barWidth + 0.5)
                : 0;
            if (barLen == 0 && d.second > 0) barLen = 1;

            cout << left  << setw(13) << d.first
                 << right << setw(13) << fixed << setprecision(2) << d.second
                 << "   " << ansi::GREEN << string(barLen, '#') << ansi::RESET << "\n";
        }

        cout << ansi::DIM << string(78, '-') << ansi::RESET << "\n";
        cout << "Days with sales: " << ansi::BOLD << daily.size() << ansi::RESET
             << "    |    Grand total: " << ansi::BOLD << ansi::GREEN
             << "$" << fixed << setprecision(2) << grandTotal << ansi::RESET
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
        cout << ansi::BOLD
             << left  << setw(10) << "Category"
             << right << setw(8)  << "Units"
             << setw(13) << "Revenue ($)"
             << setw(8)  << "Share"
             << "   " << left << "Chart"
             << ansi::RESET << "\n";
        cout << ansi::DIM << string(78, '-') << ansi::RESET << "\n";

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

            cout << left  << setw(10) << c.first
                 << right << setw(8)  << units
                 << setw(13) << fixed << setprecision(2) << c.second
                 << setw(8)  << pct.str()
                 << "   " << ansi::CYAN << string(barLen, '#') << ansi::RESET << "\n";
        }

        cout << ansi::DIM << string(78, '-') << ansi::RESET << "\n";
        cout << "Categories with sales: " << ansi::BOLD << byCat.size() << ansi::RESET
             << "    |    Grand total: " << ansi::BOLD << ansi::GREEN
             << "$" << fixed << setprecision(2) << grandTotal << ansi::RESET
             << "    |    Top: " << ansi::BOLD << byCat.front().first
             << ansi::RESET
             << " ($" << byCat.front().second << ")\n";
    }

    void lowStockReport() {
        printHeader("LOW STOCK REPORT");
        int threshold = InputValidator::readInt(
            "Threshold (items at or below): ", 0, 100000);

        cout << "\n" << ansi::BOLD
             << left  << setw(5)  << "ID"
             << setw(8)  << "Cat."
             << setw(36) << "Model"
             << right << setw(10) << "Stock"
             << ansi::RESET << "\n";
        cout << ansi::DIM << string(60, '-') << ansi::RESET << "\n";

        int count = 0;
        for (const auto& item : inventory) {
            if (item.quantity <= threshold) {
                bool low = item.quantity < LOW_STOCK_THRESHOLD;
                string rowColor = low ? (ansi::BOLD + ansi::RED) : ansi::YELLOW;
                cout << rowColor
                     << left  << setw(5)  << item.id
                     << setw(8)  << item.category
                     << setw(36) << item.model.substr(0, 35)
                     << right << setw(10) << item.quantity
                     << ansi::RESET << "\n";
                count++;
            }
        }
        cout << ansi::DIM << string(60, '-') << ansi::RESET << "\n";
        cout << "Items at or below " << threshold << ": "
             << ansi::BOLD << count << ansi::RESET << "\n";
    }
};

// =====================================================================
//  MENU
// =====================================================================
void showMenu() {
    cout << "\n";
    cout << ansi::BLUE
         << "+============================================================+\n"
         << "|" << ansi::RESET << ansi::BOLD << ansi::CYAN
         << "         PC COMPONENTS WAREHOUSE MANAGEMENT - PRO           "
         << ansi::RESET << ansi::BLUE << "|\n"
         << "+============================================================+\n"
         << ansi::RESET;
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << " 1." << ansi::RESET
         << " View Full Inventory                                    "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << " 2." << ansi::RESET
         << " Filter by Category                                     "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << " 3." << ansi::RESET
         << " Search by Model                                        "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << " 4." << ansi::RESET
         << " Update Stock / Price                                   "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << " 5." << ansi::RESET
         << " Record a Sale                                          "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << " 6." << ansi::RESET
         << " " << ansi::BOLD << "Add New Component (Smart Mode)" << ansi::RESET
         << "                         "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << " 7." << ansi::RESET
         << " Remove Component                                       "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << " 8." << ansi::RESET
         << " Low Stock Report                                       "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << " 9." << ansi::RESET
         << " View Sales History                                     "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << "10." << ansi::RESET
         << " Daily Revenue Summary                                  "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << "11." << ansi::RESET
         << " Revenue by Category                                    "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE << "|" << ansi::RESET
         << "  " << ansi::CYAN << "12." << ansi::RESET
         << " Exit                                                   "
         << ansi::BLUE << "|" << ansi::RESET << "\n";
    cout << ansi::BLUE
         << "+============================================================+"
         << ansi::RESET << "\n";
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
                cout << "\n" << ansi::GREEN
                     << "All changes saved to inventory.csv and sales_history.csv. Goodbye!"
                     << ansi::RESET << "\n";
                break;
        }
    } while (choice != 12);

    return 0;
}
