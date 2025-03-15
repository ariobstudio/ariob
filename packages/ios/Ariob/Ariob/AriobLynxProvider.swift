import Foundation

struct WebVieww: UIViewRepresentable {
    var url: URL?
    func makeUIView(context: Context) -> WKWebView {
        return WKWebView()
    }
    
    func updateUIView(_ webView: UIViewType, context: Context) {

        
        if let url = url {
            let requestResponse = URLRequest(url: url)
            
            webView.load(requestResponse)
        }
    }

class AriobLynxProvider: NSObject, LynxTemplateProvider {
  func loadTemplate(withUrl url: String!, onComplete callback: LynxTemplateLoadBlock!) {
    if let filePath = Bundle.main.path(forResource: url, ofType: "bundle") {
      do {
        let data = try Data(contentsOf: URL(fileURLWithPath: filePath))
        callback(data, nil)
      } catch {
        print("Error reading file: \(error.localizedDescription)")
        callback(nil, error)
      }
    } else {
      let urlError = NSError(domain: "com.lynx", code: 400, userInfo: [NSLocalizedDescriptionKey: "Invalid URL."])
      callback(nil, urlError)
    }
  }
}
