//
//  File.swift
//  Ariob
//
//  Created by Natnael Teferi on 3/14/25.
//

import UIKit

class ViewController: UIViewController {

  override func viewDidLoad() {
    super.viewDidLoad()

    let lynxView = LynxView { builder in
      builder.config = LynxConfig(provider: AriobLynxProvider())
      builder.screenSize = self.view.frame.size
      builder.fontScale = 1.0
    }
    
    lynxView.preferredLayoutWidth = self.view.frame.size.width
    lynxView.preferredLayoutHeight = self.view.frame.size.height
    lynxView.layoutWidthMode = .exact
    lynxView.layoutHeightMode = .exact
    self.view.addSubview(lynxView)

    lynxView.loadTemplate(fromURL: "main.lynx", initData: nil)
  }
}
