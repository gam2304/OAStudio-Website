"""Generates postman/OAStudio-API.postman_collection.json (Postman v2.1).

Usage: python postman/build_collection.py postman/OAStudio-API.postman_collection.json
"""
import json, sys

OUT = sys.argv[1]

def req(name, method, path, tests, body=None, auth=True, form=None, query=None, pre=None, token=None):
    url_raw = "{{baseUrl}}" + path + (("?" + "&".join(f"{k}={v}" for k, v in query)) if query else "")
    url = {"raw": url_raw, "host": ["{{baseUrl}}"], "path": [p for p in path.strip("/").split("/")]}
    if query:
        url["query"] = [{"key": k, "value": v} for k, v in query]
    r = {"method": method, "header": [], "url": url}
    if not auth:
        r["auth"] = {"type": "noauth"}
    if token:
        r["auth"] = {"type": "bearer", "bearer": [{"key": "token", "value": token, "type": "string"}]}
    if body is not None:
        r["header"].append({"key": "Content-Type", "value": "application/json"})
        r["body"] = {"mode": "raw", "raw": json.dumps(body, indent=2), "options": {"raw": {"language": "json"}}}
    if form is not None:
        r["body"] = {"mode": "formdata", "formdata": form}
    item = {"name": name, "request": r, "event": [
        {"listen": "test", "script": {"type": "text/javascript", "exec": tests.strip("\n").split("\n")}}]}
    if pre:
        item["event"].insert(0, {"listen": "prerequest", "script": {"type": "text/javascript", "exec": pre.strip("\n").split("\n")}})
    return item

def folder(name, items, desc=""):
    return {"name": name, "description": desc, "item": items}

def status(code):
    return f'pm.test("Status is {code}", () => pm.response.to.have.status({code}));\n'

def error_body(code):
    return status(code) + f'pm.test("Error body has status {code}", () => pm.expect(pm.response.json().status).to.eql({code}));\n'

def validation(*fields):
    checks = "".join(f'    pm.expect(m, "messages.{f}").to.have.property("{f}");\n' for f in fields)
    return status(400) + 'pm.test("Validation messages name the bad fields", () => {\n    const m = pm.response.json().messages;\n' + checks + '});\n'

FAST = 'pm.test("Responds under 2s", () => pm.expect(pm.response.responseTime).to.be.below(2000));\n'
RUN = "{{runId}}"

# ---------------------------------------------------------------- auth
auth = folder("01 Authentication", [
    req("Login - wrong password", "POST", "/api/auth/login",
        error_body(401) + 'pm.test("No token issued", () => pm.expect(pm.response.json()).to.not.have.property("accessToken"));',
        {"username": "{{adminUsername}}", "password": "wrong-password-{{runId}}"}, auth=False),
    req("Login - unknown user", "POST", "/api/auth/login", error_body(401),
        {"username": "nobody-{{runId}}", "password": "whatever"}, auth=False),
    req("Login - missing fields", "POST", "/api/auth/login", validation("username", "password"), {}, auth=False),
    req("Login - valid credentials", "POST", "/api/auth/login", status(200) + FAST + '''
const body = pm.response.json();
pm.test("Bearer token returned", () => {
    pm.expect(body.tokenType).to.eql("Bearer");
    pm.expect(body.accessToken).to.be.a("string");
    pm.expect(body.accessToken.split(".")).to.have.lengthOf(3);
    pm.expect(body.expiresIn).to.be.above(0);
});
pm.test("JWT carries ADMIN role and subject", () => {
    const payload = JSON.parse(atob(body.accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    pm.expect(payload.sub).to.eql(pm.environment.get("adminUsername") || pm.collectionVariables.get("adminUsername"));
    pm.expect(payload.roles.join(",")).to.match(/ADMIN/);
    pm.expect(payload.exp).to.be.above(payload.iat);
});
pm.collectionVariables.set("accessToken", body.accessToken);
''', {"username": "{{adminUsername}}", "password": "{{adminPassword}}"}, auth=False),
])

# ---------------------------------------------------------------- security
security = folder("02 Security", [
    req("Admin endpoint without token", "GET", "/api/admin/projects", error_body(401) +
        'pm.test("WWW-Authenticate: Bearer", () => pm.response.to.have.header("WWW-Authenticate", "Bearer"));', auth=False),
    req("Admin endpoint with forged token", "GET", "/api/admin/projects", error_body(401),
        pre='pm.request.headers.upsert({key: "Authorization", value: "Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ4Iiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdfQ.bad"});',
        auth=False),
    req("Admin write without token", "POST", "/api/admin/categories", status(401),
        {"categoryName": "Should not exist {{runId}}", "slug": "should-not-exist-{{runId}}"}, auth=False),
    req("Contact inbox is not public", "GET", "/api/admin/contact-messages", status(401), auth=False),
    req("Public projects need no token", "GET", "/api/public/projects", status(200) + FAST +
        'pm.test("Returns an array", () => pm.expect(pm.response.json()).to.be.an("array"));', auth=False),
    req("Public categories need no token", "GET", "/api/public/categories", status(200) +
        'pm.test("Returns an array", () => pm.expect(pm.response.json()).to.be.an("array"));', auth=False),
    req("Security headers present", "GET", "/api/public/categories", status(200) + '''
pm.test("Security headers", () => {
    pm.response.to.have.header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    pm.response.to.have.header("Referrer-Policy", "no-referrer");
    pm.response.to.have.header("X-Content-Type-Options", "nosniff");
    pm.response.to.have.header("X-Frame-Options", "DENY");
});
''', auth=False),
])

# ---------------------------------------------------------------- categories
cat_body = {"categoryName": "Test Category " + RUN, "slug": "test-category-" + RUN, "description": "Created by the Postman suite"}
categories = folder("03 Categories", [
    req("Create category", "POST", "/api/admin/categories", status(201) + '''
const c = pm.response.json();
pm.test("Category echoes input", () => {
    pm.expect(c.id).to.be.a("number");
    pm.expect(c.categoryName).to.eql("Test Category " + pm.collectionVariables.get("runId"));
    pm.expect(c.slug).to.eql("test-category-" + pm.collectionVariables.get("runId"));
});
pm.collectionVariables.set("categoryId", c.id);
pm.collectionVariables.set("categorySlug", c.slug);
''', cat_body),
    req("Create category - duplicate name", "POST", "/api/admin/categories", error_body(409),
        {**cat_body, "slug": "other-slug-" + RUN}),
    req("Create category - duplicate slug", "POST", "/api/admin/categories", error_body(409),
        {**cat_body, "categoryName": "Other Name " + RUN}),
    req("Create category - blank fields", "POST", "/api/admin/categories", validation("categoryName", "slug"),
        {"categoryName": "", "slug": ""}),
    req("Get category by id", "GET", "/api/admin/categories/{{categoryId}}", status(200) +
        'pm.test("Same id", () => pm.expect(pm.response.json().id).to.eql(Number(pm.collectionVariables.get("categoryId"))));'),
    req("Get category - unknown id", "GET", "/api/admin/categories/999999999", error_body(404)),
    req("Admin list contains category", "GET", "/api/admin/categories", status(200) +
        'pm.test("Contains created category", () => pm.expect(pm.response.json().map(c => c.id)).to.include(Number(pm.collectionVariables.get("categoryId"))));'),
    req("Public list contains category", "GET", "/api/public/categories", status(200) +
        'pm.test("Contains created category", () => pm.expect(pm.response.json().map(c => c.slug)).to.include(pm.collectionVariables.get("categorySlug")));',
        auth=False),
    req("Update category", "PUT", "/api/admin/categories/{{categoryId}}", status(200) +
        'pm.test("Description updated", () => pm.expect(pm.response.json().description).to.eql("Updated by the Postman suite"));',
        {**cat_body, "description": "Updated by the Postman suite"}),
    req("Update category - unknown id", "PUT", "/api/admin/categories/999999999", error_body(404),
        {**cat_body, "slug": "ghost-" + RUN, "categoryName": "Ghost " + RUN}),
])

# ---------------------------------------------------------------- projects
proj = {"title": "Test Villa " + RUN, "slug": "test-villa-" + RUN, "location": "Tunis, Tunisia", "year": 2024,
        "description": "Created by the Postman suite.", "architecturalConcept": "Mass and light.", "area": 350.5,
        "status": "DRAFT", "categoryId": "{{categoryId}}"}

def proj_json(**over):
    # categoryId must be a JSON number, so the placeholder is unquoted after dumping
    return {**proj, **over}

def in_list(var, present=True):
    neg = "" if present else ".not"
    word = "Contains" if present else "Does not contain"
    return f'pm.test("{word} test project", () => pm.expect(pm.response.json().map(p => p.id)).to{neg}.include(Number(pm.collectionVariables.get("{var}"))));\n'

projects = folder("04 Projects", [
    req("Create project (draft)", "POST", "/api/admin/projects", status(201) + '''
const p = pm.response.json();
pm.test("Project fields saved", () => {
    pm.expect(p.id).to.be.a("number");
    pm.expect(p.status).to.eql("DRAFT");
    pm.expect(p.year).to.eql(2024);
    pm.expect(Number(p.area)).to.eql(350.5);
    pm.expect(p.category.id).to.eql(Number(pm.collectionVariables.get("categoryId")));
    pm.expect(p.createdAt, "createdAt").to.be.a("string");
});
pm.collectionVariables.set("projectId", p.id);
pm.collectionVariables.set("projectSlug", p.slug);
''', proj_json()),
    req("Create project - missing required fields", "POST", "/api/admin/projects",
        validation("title", "slug", "status", "categoryId"), {"location": "Nowhere"}),
    req("Create project - year out of range", "POST", "/api/admin/projects", validation("year"),
        proj_json(slug="bad-year-" + RUN, year=1800)),
    req("Create project - negative area", "POST", "/api/admin/projects", validation("area"),
        proj_json(slug="bad-area-" + RUN, area=-1)),
    req("Create project - duplicate slug", "POST", "/api/admin/projects", error_body(409), proj_json(title="Duplicate " + RUN)),
    req("Create project - unknown category", "POST", "/api/admin/projects", error_body(404),
        proj_json(slug="no-category-" + RUN, categoryId=999999999)),
    req("Create project - invalid status value", "POST", "/api/admin/projects", status(400),
        proj_json(slug="bad-status-" + RUN, status="FINISHED")),
    req("Get project by id", "GET", "/api/admin/projects/{{projectId}}", status(200) +
        'pm.test("Same slug", () => pm.expect(pm.response.json().slug).to.eql(pm.collectionVariables.get("projectSlug")));'),
    req("Get project - unknown id", "GET", "/api/admin/projects/999999999", error_body(404)),
    req("Admin list contains draft", "GET", "/api/admin/projects", status(200) + in_list("projectId")),
    req("Public list hides draft", "GET", "/api/public/projects", status(200) + in_list("projectId", False) +
        'pm.test("Only PUBLISHED projects are public", () => pm.response.json().forEach(p => pm.expect(p.status).to.eql("PUBLISHED")));',
        auth=False),
    req("Public slug hides draft", "GET", "/api/public/projects/{{projectSlug}}", error_body(404), auth=False),
    req("Public gallery hides draft", "GET", "/api/public/projects/{{projectSlug}}/images", status(404), auth=False),
    req("Update project", "PUT", "/api/admin/projects/{{projectId}}", status(200) +
        'pm.test("Title updated", () => pm.expect(pm.response.json().title).to.eql("Test Villa Updated " + pm.collectionVariables.get("runId")));',
        proj_json(title="Test Villa Updated " + RUN)),
    req("Update project - unknown id", "PUT", "/api/admin/projects/999999999", error_body(404), proj_json(slug="ghost-" + RUN)),
    req("Publish project", "PATCH", "/api/admin/projects/{{projectId}}/status", status(200) +
        'pm.test("Now PUBLISHED", () => pm.expect(pm.response.json().status).to.eql("PUBLISHED"));',
        query=[("status", "PUBLISHED")]),
    req("Change status - invalid value", "PATCH", "/api/admin/projects/{{projectId}}/status", status(400),
        query=[("status", "FINISHED")]),
    req("Change status - missing value", "PATCH", "/api/admin/projects/{{projectId}}/status", status(400)),
    req("Public list shows published", "GET", "/api/public/projects", status(200) + in_list("projectId"), auth=False),
    req("Public slug shows published", "GET", "/api/public/projects/{{projectSlug}}", status(200) + '''
const p = pm.response.json();
pm.test("Published project with category", () => {
    pm.expect(p.status).to.eql("PUBLISHED");
    pm.expect(p.category.slug).to.eql(pm.collectionVariables.get("categorySlug"));
});
''', auth=False),
    req("Public slug - unknown", "GET", "/api/public/projects/no-such-project-{{runId}}", error_body(404), auth=False),
    req("Filter by status", "GET", "/api/admin/projects/status/PUBLISHED", status(200) + in_list("projectId")),
    req("Filter by status - invalid", "GET", "/api/admin/projects/status/FINISHED", status(400)),
    req("Filter by category", "GET", "/api/admin/projects/category/{{categoryId}}", status(200) + in_list("projectId")),
    req("Filter by category - unknown", "GET", "/api/admin/projects/category/999999999", error_body(404)),
])

# ---------------------------------------------------------------- images
image_body = {"imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg", "altText": "Facade " + RUN, "displayOrder": 1}
img_file = [{"key": "file", "type": "file", "src": "postman/fixtures/test-image.png"}]
txt_file = [{"key": "file", "type": "file", "src": "postman/fixtures/not-an-image.txt"}]
images = folder("05 Project Images", [
    req("Add image by URL", "POST", "/api/admin/projects/{{projectId}}/images", status(201) + '''
const i = pm.response.json();
pm.test("Image saved", () => {
    pm.expect(i.id).to.be.a("number");
    pm.expect(i.displayOrder).to.eql(1);
});
pm.collectionVariables.set("imageId", i.id);
''', image_body),
    req("Add image - validation", "POST", "/api/admin/projects/{{projectId}}/images", validation("imageUrl", "displayOrder"),
        {"imageUrl": "", "displayOrder": -1}),
    req("Add image - unknown project", "POST", "/api/admin/projects/999999999/images", error_body(404), image_body),
    req("List images (admin)", "GET", "/api/admin/projects/{{projectId}}/images", status(200) + '''
const list = pm.response.json();
pm.test("Contains added image", () => pm.expect(list.map(i => i.id)).to.include(Number(pm.collectionVariables.get("imageId"))));
pm.test("Sorted by displayOrder", () => list.slice(1).forEach((img, k) => pm.expect(img.displayOrder).to.be.at.least(list[k].displayOrder)));
'''),
    req("Public gallery of published project", "GET", "/api/public/projects/{{projectSlug}}/images", status(200) +
        'pm.test("Contains added image", () => pm.expect(pm.response.json().map(i => i.id)).to.include(Number(pm.collectionVariables.get("imageId"))));',
        auth=False),
    req("Update image (reorder)", "PUT", "/api/admin/project-images/{{imageId}}", status(200) +
        'pm.test("displayOrder updated", () => pm.expect(pm.response.json().displayOrder).to.eql(0));',
        {**image_body, "displayOrder": 0}),
    req("Update image - unknown id", "PUT", "/api/admin/project-images/999999999", error_body(404), image_body),
    req("Upload image - rejects non-image file", "POST", "/api/admin/projects/{{projectId}}/images/upload", status(400), form=txt_file),
    req("Upload image - missing file", "POST", "/api/admin/projects/{{projectId}}/images/upload", status(400), form=[]),
    req("Upload image to Cloudinary", "POST", "/api/admin/projects/{{projectId}}/images/upload", status(201) + '''
const i = pm.response.json();
pm.test("Stored on Cloudinary", () => pm.expect(i.imageUrl).to.match(/^https:\\/\\/res\\.cloudinary\\.com\\//));
pm.collectionVariables.set("uploadedImageId", i.id);
''', form=img_file + [{"key": "altText", "value": "Uploaded " + RUN, "type": "text"}, {"key": "displayOrder", "value": "2", "type": "text"}]),
    req("Delete uploaded image", "DELETE", "/api/admin/project-images/{{uploadedImageId}}", status(204)),
    req("Upload cover - rejects non-image file", "POST", "/api/admin/projects/{{projectId}}/cover", status(400), form=txt_file),
    req("Upload cover to Cloudinary", "POST", "/api/admin/projects/{{projectId}}/cover", status(201) +
        'pm.test("coverImageUrl set", () => pm.expect(pm.response.json().coverImageUrl).to.match(/^https:\\/\\/res\\.cloudinary\\.com\\//));',
        form=img_file),
    req("Delete cover", "DELETE", "/api/admin/projects/{{projectId}}/cover", status(204)),
    req("Cover removed", "GET", "/api/admin/projects/{{projectId}}", status(200) +
        'pm.test("coverImageUrl cleared", () => pm.expect(pm.response.json().coverImageUrl).to.be.null);'),
    req("Set cover from gallery image", "PUT", "/api/admin/projects/{{projectId}}/cover/{{imageId}}", status(200) +
        'pm.test("Cover is the gallery image", () => pm.expect(pm.response.json().coverImageUrl).to.eql("' + image_body["imageUrl"] + '"));'),
    req("Set cover - image not in project", "PUT", "/api/admin/projects/{{projectId}}/cover/999999999", error_body(404)),
])

# ---------------------------------------------------------------- contact
msg = {"senderName": "Postman Tester", "senderEmail": "tester@example.com", "subject": "Suite run " + RUN, "message": "Automated test message."}
contact = folder("06 Contact Messages", [
    req("Submit message (public)", "POST", "/api/contact-messages", status(201) + '''
const m = pm.response.json();
pm.test("Stored as NEW", () => {
    pm.expect(m.id).to.be.a("number");
    pm.expect(m.status).to.eql("NEW");
});
pm.collectionVariables.set("messageId", m.id);
''', msg, auth=False),
    req("Submit - missing fields", "POST", "/api/contact-messages", validation("senderName", "senderEmail", "message"), {}, auth=False),
    req("Submit - invalid email", "POST", "/api/contact-messages", validation("senderEmail"), {**msg, "senderEmail": "not-an-email"}, auth=False),
    req("Submit - name too long", "POST", "/api/contact-messages", validation("senderName"), {**msg, "senderName": "x" * 151}, auth=False),
    req("Count new messages", "GET", "/api/admin/contact-messages/count/new", status(200) +
        'pm.test("At least one new message", () => pm.expect(pm.response.json()).to.be.a("number").and.at.least(1));'),
    req("List messages", "GET", "/api/admin/contact-messages", status(200) +
        'pm.test("Contains submitted message", () => pm.expect(pm.response.json().map(m => m.id)).to.include(Number(pm.collectionVariables.get("messageId"))));'),
    req("Get message by id", "GET", "/api/admin/contact-messages/{{messageId}}", status(200) +
        'pm.test("Content intact", () => pm.expect(pm.response.json().message).to.eql("Automated test message."));'),
    req("Get message - unknown id", "GET", "/api/admin/contact-messages/999999999", error_body(404)),
    req("Mark as READ", "PATCH", "/api/admin/contact-messages/{{messageId}}/status", status(200) +
        'pm.test("Status READ", () => pm.expect(pm.response.json().status).to.eql("READ"));', query=[("status", "READ")]),
    req("Mark - invalid status", "PATCH", "/api/admin/contact-messages/{{messageId}}/status", status(400), query=[("status", "SPAM")]),
    req("Filter by status READ", "GET", "/api/admin/contact-messages/status/READ", status(200) +
        'pm.test("Contains message", () => pm.expect(pm.response.json().map(m => m.id)).to.include(Number(pm.collectionVariables.get("messageId"))));'),
    req("Delete message", "DELETE", "/api/admin/contact-messages/{{messageId}}", status(204)),
    req("Message gone", "GET", "/api/admin/contact-messages/{{messageId}}", error_body(404)),
])

# ---------------------------------------------------------------- admin accounts
TEMP = "{{tempToken}}"
tmp_login = {"username": "tmpadmin" + RUN, "password": "TempPass-" + RUN}
admins = folder("07 Admin Accounts", [
    req("List admins", "GET", "/api/admin/admins", status(200) + '''
const list = pm.response.json();
const main = list.find(a => a.role === "SUPER_ADMIN");
pm.test("Exactly one main admin", () => pm.expect(list.filter(a => a.role === "SUPER_ADMIN")).to.have.lengthOf(1));
pm.test("No password hashes exposed", () => list.forEach(a => pm.expect(a).to.not.have.property("passwordHash")));
pm.test("At most 5 admins", () => pm.expect(list.length).to.be.at.most(5));
pm.collectionVariables.set("superAdminId", main.id);
'''),
    req("Create admin - validation", "POST", "/api/admin/admins", validation("username", "email", "password"),
        {"username": "", "email": "not-an-email", "password": "short"}),
    req("Create admin", "POST", "/api/admin/admins", status(201) + '''
const a = pm.response.json();
pm.test("Created as regular ADMIN", () => pm.expect(a.role).to.eql("ADMIN"));
pm.collectionVariables.set("tempAdminId", a.id);
''', {**tmp_login, "email": "tmp-" + RUN + "@example.com"}),
    req("Create admin - duplicate username", "POST", "/api/admin/admins", error_body(409),
        {**tmp_login, "email": "other-" + RUN + "@example.com"}),
    req("Login as new admin", "POST", "/api/auth/login", status(200) +
        'pm.collectionVariables.set("tempToken", pm.response.json().accessToken);', tmp_login, auth=False),
    req("Regular admin cannot list admins", "GET", "/api/admin/admins", error_body(403), token=TEMP),
    req("Regular admin can use admin API", "GET", "/api/admin/projects", status(200), token=TEMP),
    req("Change own password - wrong current", "PUT", "/api/admin/account/password", error_body(400),
        {"currentPassword": "wrong-" + RUN, "newPassword": "TempPass2-" + RUN}, token=TEMP),
    req("Change own password - validation", "PUT", "/api/admin/account/password", validation("currentPassword", "newPassword"),
        {"currentPassword": "", "newPassword": "short"}, token=TEMP),
    req("Change own password", "PUT", "/api/admin/account/password", status(204),
        {"currentPassword": "TempPass-" + RUN, "newPassword": "TempPass2-" + RUN}, token=TEMP),
    req("Login with changed password", "POST", "/api/auth/login", status(200),
        {"username": "tmpadmin" + RUN, "password": "TempPass2-" + RUN}, auth=False),
    req("Main admin resets password", "PUT", "/api/admin/admins/{{tempAdminId}}/password", status(204),
        {"newPassword": "TempPass3-" + RUN}),
    req("Login with reset password", "POST", "/api/auth/login", status(200),
        {"username": "tmpadmin" + RUN, "password": "TempPass3-" + RUN}, auth=False),
    req("Reset main admin password is refused", "PUT", "/api/admin/admins/{{superAdminId}}/password", error_body(403),
        {"newPassword": "Whatever123"}),
    req("Delete main admin is refused", "DELETE", "/api/admin/admins/{{superAdminId}}", error_body(403)),
    req("Login locked after 5 failures", "POST", "/api/auth/login", error_body(429),
        {"username": "tmpadmin" + RUN, "password": "wrong"}, auth=False, pre='''
// 5 wrong passwords lock the account for 15 minutes; this request is the 6th try
const body = JSON.stringify({ username: "tmpadmin" + pm.collectionVariables.get("runId"), password: "wrong" });
for (let i = 0; i < 5; i++) {
    pm.sendRequest({ url: pm.collectionVariables.get("baseUrl") + "/api/auth/login", method: "POST",
        header: { "Content-Type": "application/json" }, body: { mode: "raw", raw: body } }, () => {});
}
'''),
    req("Delete admin", "DELETE", "/api/admin/admins/{{tempAdminId}}", status(204)),
    req("Removed admin's token is rejected", "GET", "/api/admin/projects", error_body(401), token=TEMP),
    req("Delete admin - unknown id", "DELETE", "/api/admin/admins/999999999", error_body(404)),
])

# ---------------------------------------------------------------- cleanup
cleanup = folder("08 Cleanup & Integrity", [
    req("Delete category in use is refused", "DELETE", "/api/admin/categories/{{categoryId}}", error_body(409)),
    req("Delete image", "DELETE", "/api/admin/project-images/{{imageId}}", status(204)),
    req("Delete image - unknown id", "DELETE", "/api/admin/project-images/999999999", error_body(404)),
    req("Delete project", "DELETE", "/api/admin/projects/{{projectId}}", status(204)),
    req("Project gone", "GET", "/api/admin/projects/{{projectId}}", error_body(404)),
    req("Delete project - unknown id", "DELETE", "/api/admin/projects/999999999", error_body(404)),
    req("Delete category", "DELETE", "/api/admin/categories/{{categoryId}}", status(204)),
    req("Category gone", "GET", "/api/admin/categories/{{categoryId}}", error_body(404)),
])

collection = {
    "info": {
        "name": "OAStudio API",
        "description": "End-to-end tests for the OAStudio backend. Run the folders in order: later requests use ids "
                       "saved by earlier ones, and folder 08 deletes everything the run created.\n\n"
                       "Needs environment variables adminUsername and adminPassword. "
                       "Folder 05 uploads two 8x8 test images to Cloudinary and deletes them again. "
                       "Folder 07 creates a temporary admin and deletes it; it needs a free slot (max 5 admins).",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    "auth": {"type": "bearer", "bearer": [{"key": "token", "value": "{{accessToken}}", "type": "string"}]},
    "event": [{"listen": "prerequest", "script": {"type": "text/javascript", "exec": [
        "// One suffix per run keeps names and slugs unique",
        "if (!pm.collectionVariables.get(\"runId\") || pm.info.iteration === 0 && pm.info.requestName === \"Login - wrong password\") {",
        "    pm.collectionVariables.set(\"runId\", Date.now().toString(36));",
        "}",
    ]}}],
    "variable": [{"key": k, "value": v} for k, v in [
        ("baseUrl", "http://localhost:9001"), ("runId", ""), ("accessToken", ""), ("categoryId", ""), ("categorySlug", ""),
        ("projectId", ""), ("projectSlug", ""), ("imageId", ""), ("uploadedImageId", ""), ("messageId", ""),
        ("superAdminId", ""), ("tempAdminId", ""), ("tempToken", "")]],
    "item": [auth, security, categories, projects, images, contact, admins, cleanup],
}

text = json.dumps(collection, indent=2, ensure_ascii=False)
# categoryId placeholders must be JSON numbers, not strings
text = text.replace('\\"categoryId\\": \\"{{categoryId}}\\"', '\\"categoryId\\": {{categoryId}}')
open(OUT, "w", encoding="utf-8", newline="\n").write(text + "\n")
n = sum(len(f["item"]) for f in collection["item"])
print(f"{n} requests written to {OUT}")
