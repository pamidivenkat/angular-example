import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { AuthenticationService } from "../core/services/authentication.service";

@Component({
  selector: "app-auth-callback",
  templateUrl: "./auth-callback.component.html",
  styleUrls: ["./auth-callback.component.scss"]
})
export class AuthCallbackComponent implements OnInit {
  constructor(private _router: Router, private _authService: AuthenticationService) {}

  ngOnInit() {
    this._authService.completeAuthentication();
    const returnUrl = localStorage.getItem("returnUrl") || "/";
    setTimeout(() => {
      localStorage.removeItem("returnUrl");
      this._router.navigateByUrl(returnUrl);
    }, 500);
  }
}
